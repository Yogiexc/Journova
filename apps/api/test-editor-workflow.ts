import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001/api/v1';

async function fetchApi(endpoint: string, method: string = 'GET', body?: any, token?: string) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  return { status: res.status, data: json };
}

async function registerAndLogin(email: string, name: string, roleName: string) {
  console.log(`Registering ${email} as ${roleName}...`);
  await prisma.user.deleteMany({ where: { email } }).catch(() => {});
  
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    role = await prisma.role.create({ data: { name: roleName } });
  }

  const resReg = await fetchApi('/auth/register', 'POST', {
    name,
    email,
    password: 'password123',
    role_id: role.id,
  });

  if (resReg.status !== 201) throw new Error(`Register failed: ${JSON.stringify(resReg.data)}`);

  console.log(`Logging in ${email}...`);
  const resLogin = await fetchApi('/auth/login', 'POST', {
    email,
    password: 'password123',
  });

  if (resLogin.status !== 200 && resLogin.status !== 201) throw new Error(`Login failed: ${JSON.stringify(resLogin.data)}`);
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  // Force assign the requested role for testing purposes since /auth/register hardcodes AUTHOR
  await prisma.userRole.deleteMany({ where: { user_id: user!.id } });
  await prisma.userRole.create({
    data: { user_id: user!.id, role_id: role.id }
  });

  return { token: resLogin.data.data.access_token, user: user! };
}

async function runTests() {
  console.log('--- STARTING EDITOR WORKFLOW E2E TESTS ---');
  
  // Setup users
  const editor = await registerAndLogin('editor_test@example.com', 'Editor', 'EDITOR');
  const author = await registerAndLogin('author_test_e@example.com', 'Author', 'AUTHOR');
  const reviewer1 = await registerAndLogin('reviewer1_test@example.com', 'Reviewer 1', 'REVIEWER');
  const reviewer2 = await registerAndLogin('reviewer2_test@example.com', 'Reviewer 2', 'REVIEWER');

  // Setup Article & Submission
  const journal = await prisma.journal.findFirst();
  if (!journal) throw new Error('No journal found in DB.');

  const article = await prisma.article.create({
    data: {
      journal_id: journal.id,
      title: 'Editor Test Article',
      slug: `editor-test-article-${Date.now()}`,
      status: 'SUBMITTED',
      authors: {
        create: [
          {
            author: {
              create: {
                full_name: 'Author Test E',
                user_id: author.user.id,
                email: 'author_test_e@example.com'
              }
            },
            author_order: 1,
            is_corresponding: true
          }
        ]
      }
    },
    include: { authors: true }
  });

  const submission = await prisma.submission.create({
    data: {
      article_id: article.id,
      submitted_by: author.user.id,
      status: 'SUBMITTED',
    }
  });

  const round = await prisma.submissionRound.create({
    data: {
      submission_id: submission.id,
      round_number: 1,
      status: 'IN_PROGRESS'
    }
  });

  const file = await prisma.file.create({
    data: {
      storage_provider: 'local',
      storage_key: 'mock/path.pdf',
      original_name: 'manuscript.pdf',
      mime_type: 'application/pdf',
      size: 1000,
      uploaded_by: author.user.id
    }
  });

  await prisma.submissionVersion.create({
    data: {
      round_id: round.id,
      version_number: 1,
      file_id: file.id,
      uploaded_by: author.user.id,
    }
  });

  try {
    console.log('\n[1] Author trying to access editor queue...');
    const authRes = await fetchApi('/editor/submissions', 'GET', undefined, author.token);
    if (authRes.status !== 403) throw new Error(`Author should be blocked, got ${authRes.status}`);
    console.log('Author blocked successfully.');

    console.log('\n[2] Editor listing submissions...');
    const listRes = await fetchApi('/editor/submissions', 'GET', undefined, editor.token);
    if (listRes.status !== 200) throw new Error(`Editor list failed: ${JSON.stringify(listRes.data)}`);
    console.log('Success.');

    console.log('\n[3] Editor fetching submission detail...');
    const detailRes = await fetchApi(`/editor/submissions/${submission.id}`, 'GET', undefined, editor.token);
    if (detailRes.status !== 200) throw new Error(`Editor detail failed: ${JSON.stringify(detailRes.data)}`);
    
    // Check if it's NOT double blind
    const jsonStr = JSON.stringify(detailRes.data).toLowerCase();
    if (!jsonStr.includes(author.user.id.toLowerCase())) {
      throw new Error('Editor detail seems to be double-blinded (author ID missing). It should NOT be!');
    }
    console.log('Detail fetched, Author info is visible to editor.');

    console.log('\n[4] Editor assigning author to their own paper (COI test)...');
    const coiRes = await fetchApi(`/editor/submissions/${submission.id}/reviewers`, 'POST', {
      reviewer_id: author.user.id
    }, editor.token);
    if (coiRes.status !== 400 || !JSON.stringify(coiRes.data).includes('CONFLICT_OF_INTEREST')) {
      throw new Error(`COI check failed. Expected 400 CONFLICT_OF_INTEREST, got ${coiRes.status} ${JSON.stringify(coiRes.data)}`);
    }
    console.log('COI blocked successfully.');

    console.log('\n[5] Editor assigning Reviewer 1...');
    const assign1 = await fetchApi(`/editor/submissions/${submission.id}/reviewers`, 'POST', {
      reviewer_id: reviewer1.user.id
    }, editor.token);
    if (assign1.status !== 201) throw new Error(`Assign 1 failed: ${JSON.stringify(assign1.data)}`);
    console.log('Assigned successfully.');

    // Verify submission status changed to UNDER_REVIEW
    const subAfterAssign = await prisma.submission.findUnique({ where: { id: submission.id } });
    if (subAfterAssign?.status !== 'UNDER_REVIEW') throw new Error(`Submission status is ${subAfterAssign?.status}, expected UNDER_REVIEW`);

    console.log('\n[6] Editor assigning Reviewer 1 again (Duplicate test)...');
    const assignDup = await fetchApi(`/editor/submissions/${submission.id}/reviewers`, 'POST', {
      reviewer_id: reviewer1.user.id
    }, editor.token);
    if (assignDup.status !== 400) throw new Error(`Duplicate assign should fail, got ${assignDup.status}`);
    console.log('Duplicate assigned blocked.');

    console.log('\n[7] Editor trying to make decision while Reviewer 1 is INVITED...');
    const earlyDec = await fetchApi(`/editor/submissions/${submission.id}/decision`, 'POST', {
      decision: 'ACCEPT'
    }, editor.token);
    if (earlyDec.status !== 400 || !JSON.stringify(earlyDec.data).includes('PENDING_REVIEWS')) {
      throw new Error(`Early decision should be blocked by PENDING_REVIEWS, got ${earlyDec.status}`);
    }
    console.log('Early decision blocked successfully.');

    console.log('\n[8] Simulating Reviewer 1 Completing Review...');
    // We update DB directly for this test to bypass the Reviewer Workflow which is already tested
    const assignment1 = await prisma.reviewAssignment.findFirst({ where: { round_id: round.id, reviewer_id: reviewer1.user.id } });
    await prisma.review.create({
      data: {
        assignment_id: assignment1!.id,
        recommendation: 'MINOR_REVISION',
        comments: 'Fix typos'
      }
    });
    await prisma.reviewAssignment.update({ where: { id: assignment1!.id }, data: { status: 'COMPLETED' }});

    console.log('\n[9] Editor makes decision (MINOR_REVISION)...');
    const decRes = await fetchApi(`/editor/submissions/${submission.id}/decision`, 'POST', {
      decision: 'MINOR_REVISION',
      notes: 'Please fix typos.'
    }, editor.token);
    if (decRes.status !== 201) throw new Error(`Decision failed: ${JSON.stringify(decRes.data)}`);
    console.log('Decision successful.');

    // Check statuses
    const finalSub = await prisma.submission.findUnique({ where: { id: submission.id }, include: { rounds: true }});
    const finalArt = await prisma.article.findUnique({ where: { id: article.id } });
    
    if (finalSub?.status !== 'REVISION_REQUIRED') throw new Error(`Submission status is ${finalSub?.status}`);
    if (finalArt?.status !== 'REVISION_REQUIRED') throw new Error(`Article status is ${finalArt?.status}`);
    
    const finalRound = finalSub.rounds.find(r => r.id === round.id);
    if (finalRound?.status !== 'COMPLETED') throw new Error(`Round status is ${finalRound?.status}`);
    
    console.log('Submission, Article, and Round statuses updated correctly.');

    console.log('\n[10] Editor trying invalid manual status bypass (REVISION_REQUIRED -> PUBLISHED)...');
    const bypassRes = await fetchApi(`/editor/submissions/${submission.id}/status`, 'PATCH', {
      status: 'PUBLISHED'
    }, editor.token);
    if (bypassRes.status !== 400) throw new Error(`Bypass should fail, got ${bypassRes.status}`);
    console.log('Bypass blocked successfully.');

  } finally {
    console.log('\n[11] Cleanup Fixture...');
    await prisma.editorialDecision.deleteMany({ where: { round_id: round.id } });
    await prisma.review.deleteMany({ where: { assignment: { round_id: round.id } } });
    await prisma.reviewAssignment.deleteMany({ where: { round_id: round.id } });
    await prisma.submissionVersion.deleteMany({ where: { round_id: round.id } });
    await prisma.submissionRound.deleteMany({ where: { submission_id: submission.id } });
    await prisma.submission.deleteMany({ where: { id: submission.id } });
    
    const authorRecord = await prisma.author.findFirst({ where: { user_id: author.user.id } });
    if (authorRecord) {
      await prisma.articleAuthor.deleteMany({ where: { author_id: authorRecord.id } });
      await prisma.author.deleteMany({ where: { id: authorRecord.id } });
    }
    
    await prisma.article.deleteMany({ where: { id: article.id } });
    await prisma.file.deleteMany({ where: { id: file.id } });
    
    await prisma.user.deleteMany({ 
      where: { email: { in: ['editor_test@example.com', 'author_test_e@example.com', 'reviewer1_test@example.com', 'reviewer2_test@example.com'] } } 
    });
  }

  console.log('\n✅ EDITOR WORKFLOW E2E TESTS PASSED!');
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
