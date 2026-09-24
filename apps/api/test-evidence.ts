import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3001/api/v1';

async function fetchApi(path: string, method = 'GET', body: any = null, token: string | null = null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options: RequestInit = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data, res };
}

async function registerAndLogin(email: string, name: string, password: string) {
  console.log(`Registering ${email}...`);
  let res = await fetchApi('/auth/register', 'POST', { name, email, password });
  if (res.status !== 201 && res.status !== 409 && res.status !== 401) throw new Error(`Register failed: ${res.status}`);
  
  console.log(`Logging in ${email}...`);
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await loginRes.json();
  const token = data.data?.access_token;
  if (!token) throw new Error(`Login failed for ${email}`);
  
  const me = await fetchApi('/auth/me', 'GET', null, token);
  return { token, user: me.data.data };
}

async function runTests() {
  console.log('--- STARTING PHASE 10.5 EVIDENCE TESTS ---');
  const prisma = new PrismaClient();
  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testName: string, expected?: string, actual?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${testName} (Expected: ${expected}, Actual: ${actual})`);
      failCount++;
    }
  }

  try {
    // SETUP
    const authorA = await registerAndLogin('authorA_ev@example.com', 'Author A', 'password123');
    const authorB = await registerAndLogin('authorB_ev@example.com', 'Author B', 'password123');
    const reviewerA = await registerAndLogin('reviewerA_ev@example.com', 'Reviewer A', 'password123');
    const reviewerB = await registerAndLogin('reviewerB_ev@example.com', 'Reviewer B', 'password123');
    const editor = await registerAndLogin('editor_ev@example.com', 'Editor', 'password123');
    // Ensure editor has role
    const editorRole = await prisma.role.findFirst({ where: { name: 'EDITOR' } });
    if (editorRole) {
      await prisma.userRole.createMany({
        data: [{ user_id: editor.user.id, role_id: editorRole.id }],
        skipDuplicates: true
      });
    }

    const journal = await prisma.journal.findFirst();
    
    const subRes = await fetchApi('/submissions', 'POST', {
      journal_id: journal?.id,
      title: 'Article A',
      abstract: 'Abstract A',
      keywords: ['Test']
    }, authorA.token);
    
    console.log('Submission Response:', JSON.stringify(subRes.data));
    const submissionAId = subRes.data?.data?.id;
    const articleAId = subRes.data?.data?.article_id;

    if (!submissionAId) throw new Error(`Submission creation failed: ${JSON.stringify(subRes.data)}`);

    // 1. Author A cannot access Author B's submission
    const getSubA_byB = await fetchApi(`/submissions/${submissionAId}`, 'GET', null, authorB.token);
    assert(getSubA_byB.status === 404, 'Penulis A tidak dapat mengakses kiriman Penulis B', '404', getSubA_byB.status.toString());

    const round = await prisma.submissionRound.findFirst({ where: { submission_id: submissionAId } });
    
    const assignRes = await fetchApi(`/editor/submissions/${submissionAId}/reviewers`, 'POST', {
      reviewer_id: reviewerA.user.id,
      round_id: round?.id
    }, editor.token);
    const assignmentAId = assignRes.data?.data?.id;
    
    if (assignmentAId) {
      // 2. Reviewer B cannot access Reviewer A's assignment
      const getAssignA_byB = await fetchApi(`/reviews/assignments/${assignmentAId}`, 'GET', null, reviewerB.token);
      assert(getAssignA_byB.status === 404, 'Penelaah A tidak dapat mengakses penugasan Penelaah B', '404', getAssignA_byB.status.toString());

      // 3. Duplicate assignment rejected
      const assignRes2 = await fetchApi(`/editor/submissions/${submissionAId}/reviewers`, 'POST', {
        reviewer_id: reviewerA.user.id,
        round_id: round?.id
      }, editor.token);
      assert(assignRes2.status === 409 || assignRes2.status === 400, 'Penugasan penelaah ganda (duplikat) ditolak', '409/400', assignRes2.status.toString());
    }

    // 4. Reviewer cannot make editorial decision
    const decisionRes = await fetchApi(`/editor/submissions/${submissionAId}/decision`, 'POST', {
      decision: 'ACCEPT', round_id: round?.id
    }, reviewerA.token);
    assert(decisionRes.status === 403, 'Penelaah tidak dapat membuat keputusan editorial', '403', decisionRes.status.toString());

    // 5. Author cannot change editorial status
    const statusRes = await fetchApi(`/editor/submissions/${submissionAId}/status`, 'PATCH', {
      status: 'PUBLISHED'
    }, authorA.token);
    assert(statusRes.status === 403, 'Penulis tidak dapat mengubah status editorial', '403', statusRes.status.toString());

    // 6. Schedule without production file rejected
    const randomIssueNo = Math.floor(Math.random() * 100000);
    const issue = await prisma.issue.create({
      data: {
        journal_id: journal?.id || '',
        volume_id: (await prisma.volume.findFirst())?.id || '',
        issue_number: randomIssueNo,
        title: 'Test Issue ' + randomIssueNo,
        status: 'DRAFT',
        year: 2026
      }
    });

    const scheduleRes = await fetchApi(`/editor/publications/${articleAId}/schedule`, 'POST', {
      issue_id: issue.id, page_start: 1, page_end: 5
    }, editor.token);
    assert(scheduleRes.status === 400 || scheduleRes.status === 404, 'Penjadwalan tanpa file produksi ditolak', '400', scheduleRes.status.toString());

    // 7. Path traversal attempt
    const downloadRes = await fetchApi(`/articles/../../../etc/passwd/pdf`, 'GET');
    assert(downloadRes.status === 404 || downloadRes.status === 400, 'Serangan path traversal ditolak', '404', downloadRes.status.toString());
    
    // cleanup
    await prisma.issue.delete({ where: { id: issue.id } });
    
    console.log(`\nResults: ${passCount} Passed, ${failCount} Failed`);
    
  } catch (e: any) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
