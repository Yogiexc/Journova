import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3001/api/v1';

async function fetchApi(path: string, method = 'GET', body = null, token = null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options: RequestInit = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- STARTING REVIEWER WORKFLOW E2E TESTS ---');

  const prisma = new PrismaClient();

  // Helper to register & login
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
    
    // Get user id
    const me = await fetchApi('/auth/me', 'GET', null, token);
    return { token, user: me.data.data };
  }

  // 1. Setup Data
  const reviewerA = await registerAndLogin('reviewerA@example.com', 'Reviewer A', 'password123');
  const reviewerB = await registerAndLogin('reviewerB@example.com', 'Reviewer B', 'password123');
  const author = await registerAndLogin('authorA_reviewerTest@example.com', 'Author A Test', 'password123');

  // We need a Journal ID. Let's just get the first one.
  const journal = await prisma.journal.findFirst();
  if (!journal) throw new Error('No journal found in DB.');

  // Create an Article + Submission + Round to simulate an author's submission
  const article = await prisma.article.create({
    data: {
      journal_id: journal.id,
      title: 'Double Blind Test Article',
      slug: `double-blind-test-article-${Date.now()}`,
      status: 'SUBMITTED',
      authors: {
        create: [
          {
            author: {
              create: {
                user_id: author.user.id,
                full_name: author.user.name,
                email: author.user.email,
              }
            },
            author_order: 1,
            is_corresponding: true,
          }
        ]
      }
    }
  });

  const submission = await prisma.submission.create({
    data: {
      article_id: article.id,
      submitted_by: author.user.id,
      status: 'SUBMITTED',
      rounds: {
        create: [
          { round_number: 1, status: 'IN_PROGRESS' }
        ]
      }
    },
    include: { rounds: true }
  });

  const round = submission.rounds[0];

  // Also create a mock file/version for the round to test file leakage
  const mockFile = await prisma.file.create({
    data: {
      storage_provider: 'mock',
      storage_key: 'mock/key.pdf',
      original_name: 'AuthorName_Manuscript.pdf',
      mime_type: 'application/pdf',
      size: 1000,
      uploaded_by: author.user.id,
    }
  });

  await prisma.submissionVersion.create({
    data: {
      round_id: round.id,
      version_number: 1,
      file_id: mockFile.id,
      uploaded_by: author.user.id,
    }
  });

  // Inject ReviewAssignment for Reviewer A
  const assignmentA = await prisma.reviewAssignment.create({
    data: {
      round_id: round.id,
      reviewer_id: reviewerA.user.id,
      assigned_by: reviewerB.user.id, // Just using reviewerB as mock assigner for the test
      status: 'INVITED',
    }
  });

  console.log('\\n[1] Reviewer A fetching own assignments...');
  const getAssignments = await fetchApi('/reviews/assignments', 'GET', null, reviewerA.token);
  if (getAssignments.status !== 200) throw new Error('Failed to fetch assignments');
  if (getAssignments.data.data.length === 0) throw new Error('No assignments found for Reviewer A');
  console.log('Success.');

  console.log('\\n[2] Reviewer A fetching assignment detail (Checking Double-Blind)...');
  const detailA = await fetchApi(`/reviews/assignments/${assignmentA.id}`, 'GET', null, reviewerA.token);
  if (detailA.status !== 200) throw new Error('Failed to fetch detail');
  
  const detailData = detailA.data.data;
  const jsonStr = JSON.stringify(detailData).toLowerCase();
  
  if (jsonStr.includes(author.user.id.toLowerCase())) {
    console.log('LEAK DETECTED. DETAIL DATA:', JSON.stringify(detailData, null, 2));
    throw new Error('DOUBLE BLIND LEAK: Author User ID leaked!');
  }
  if (jsonStr.includes('uploaded_by')) throw new Error('DOUBLE BLIND LEAK: "uploaded_by" field present!');
  
  console.log('Double-blind check PASSED. No author info leaked.');

  console.log('\\n[3] Reviewer B trying to read assignment of A...');
  const readB = await fetchApi(`/reviews/assignments/${assignmentA.id}`, 'GET', null, reviewerB.token);
  if (readB.status !== 404) throw new Error(`Expected 404, got ${readB.status}. OWNERSHIP LEAK!`);
  console.log('Reviewer B blocked (404).');

  console.log('\\n[4] Author trying to accept assignment...');
  const authorAccept = await fetchApi(`/reviews/assignments/${assignmentA.id}/accept`, 'POST', null, author.token);
  if (authorAccept.status !== 404) throw new Error(`Expected 404, got ${authorAccept.status}. OWNERSHIP LEAK!`);
  console.log('Author blocked (404).');

  console.log('\\n[5] Reviewer A accepting assignment...');
  const acceptRes = await fetchApi(`/reviews/assignments/${assignmentA.id}/accept`, 'POST', null, reviewerA.token);
  if (acceptRes.status !== 201) throw new Error(`Accept failed: ${JSON.stringify(acceptRes.data)}`);
  console.log('Accepted successfully.');

  console.log('\\n[6] Reviewer A accepting assignment again...');
  const acceptAgain = await fetchApi(`/reviews/assignments/${assignmentA.id}/accept`, 'POST', null, reviewerA.token);
  if (acceptAgain.status !== 400) throw new Error(`Expected 400, got ${acceptAgain.status}`);
  console.log('Second accept rejected (State protection).');

  console.log('\\n[7] Reviewer A submitting review...');
  const submitReview = await fetchApi(`/reviews/assignments/${assignmentA.id}/submit`, 'POST', {
    recommendation: 'MINOR_REVISION',
    comments: 'Good paper, needs minor revisions.',
    confidential_comments: 'To editor: valid research.'
  }, reviewerA.token);
  if (submitReview.status !== 201) throw new Error(`Submit failed: ${JSON.stringify(submitReview.data)}`);
  console.log('Review submitted.');

  console.log('\\n[8] Reviewer A submitting review again...');
  const submitAgain = await fetchApi(`/reviews/assignments/${assignmentA.id}/submit`, 'POST', {
    recommendation: 'ACCEPT',
    comments: 'Wait I change my mind',
  }, reviewerA.token);
  if (submitAgain.status !== 400) throw new Error(`Expected 400, got ${submitAgain.status}`);
  console.log('Second review rejected (1:1 constraint).');

  console.log('\\n[9] Checking DB constraint (Assignment Status)...');
  const dbAssignment = await prisma.reviewAssignment.findUnique({ where: { id: assignmentA.id }, include: { review: true } });
  if (dbAssignment.status !== 'COMPLETED') throw new Error(`Assignment not COMPLETED, is ${dbAssignment.status}`);
  if (!dbAssignment.review) throw new Error(`Review record not created!`);
  console.log('Transaction & DB state verified.');

  console.log('\\n[10] Cleanup Fixture...');
  await prisma.review.deleteMany({ where: { assignment_id: assignmentA.id } });
  await prisma.reviewAssignment.deleteMany({ where: { id: assignmentA.id } });
  await prisma.submissionVersion.deleteMany({ where: { round_id: round.id } });
  await prisma.file.deleteMany({ where: { uploaded_by: author.user.id } });
  await prisma.submissionRound.deleteMany({ where: { submission_id: submission.id } });
  await prisma.submission.deleteMany({ where: { id: submission.id } });
  await prisma.articleAuthor.deleteMany({ where: { article_id: article.id } });
  await prisma.author.deleteMany({ where: { user_id: author.user.id } });
  await prisma.article.deleteMany({ where: { id: article.id } });

  console.log('\\n--- ALL REVIEWER WORKFLOW CONDITIONS PASSED! ---');
  await prisma.$disconnect();
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
