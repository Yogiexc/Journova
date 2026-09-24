import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3001/api/v1';

async function fetchApi(path: string, method = 'GET', body: any = null, token: string | null = null, headersObj: Record<string, string> = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...headersObj };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options: RequestInit = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data, res };
}

async function registerAndLogin(email: string, name: string, password: string) {
  await fetchApi('/auth/register', 'POST', { name, email, password });
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const cookies = loginRes.headers.get('set-cookie') || '';
  const match = cookies.match(/refresh_token=([^;]+)/);
  const refreshToken = match ? match[1] : null;
  
  const data = await loginRes.json();
  const token = data.data?.access_token;
  if (!token) throw new Error(`Login failed for ${email}`);
  
  const me = await fetchApi('/auth/me', 'GET', null, token);
  return { token, refreshToken, user: me.data.data };
}

async function runTests() {
  console.log('--- STARTING FIX VALIDATION TESTS ---');
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
    const editor = await registerAndLogin('editor_new@example.com', 'Editor', 'password123');
    const reviewerA = await registerAndLogin('reviewerA_new@example.com', 'Reviewer A', 'password123');
    const authorA = await registerAndLogin('authorA_new@example.com', 'Author A', 'password123');
    
    const journal = await prisma.journal.findFirst();

    // 1. DUPLICATE ASSIGNMENT -> 409
    const randomSub = Math.floor(Math.random() * 10000);
    const sub = await prisma.submission.create({
      data: {
        article: {
          create: {
            title: 'Article 409 ' + randomSub,
            slug: 'article-409-' + randomSub,
            abstract: 'Abstract 409',
            journal_id: journal?.id || '',
            status: 'DRAFT',
            language: 'en'
          }
        },
        submitter: {
          connect: { id: authorA.user.id }
        },
        status: 'UNDER_REVIEW',
        rounds: {
          create: [{ round_number: 1, status: 'IN_PROGRESS' }]
        }
      },
      include: { rounds: true }
    });
    
    const submissionId = sub.id;
    const roundId = sub.rounds[0].id;
    
    const assignRes1 = await fetchApi(`/editor/submissions/${submissionId}/reviewers`, 'POST', {
      reviewer_id: reviewerA.user.id,
      round_id: roundId
    }, editor.token);
    
    console.log('AssignRes1:', assignRes1.status, JSON.stringify(assignRes1.data));
    
    const assignRes2 = await fetchApi(`/editor/submissions/${submissionId}/reviewers`, 'POST', {
      reviewer_id: reviewerA.user.id,
      round_id: roundId
    }, editor.token);
    
    assert(assignRes2.status === 409, 'P2002 -> 409 Conflict (Duplicate Assignment)', '409', assignRes2.status.toString());

    // 2. REFRESH TOKEN ROTATION
    console.log('\n--- TESTING REFRESH TOKEN ROTATION ---');
    console.log('Login -> Token A generated');
    const tokenA = authorA.refreshToken;
    
    console.log('Refresh with Token A...');
    const refresh1 = await fetchApi('/auth/refresh', 'POST', null, null, {
      Cookie: `refresh_token=${tokenA}`
    });
    
    const cookies1 = refresh1.res.headers.get('set-cookie') || '';
    const match1 = cookies1.match(/refresh_token=([^;]+)/);
    const tokenB = match1 ? match1[1] : null;
    
    assert(refresh1.status === 201 || refresh1.status === 200, 'Refresh Token A succeeded', '201/200', refresh1.status.toString());
    console.log('Token B generated:', !!tokenB);
    
    console.log('Refresh again with Token A...');
    const refresh2 = await fetchApi('/auth/refresh', 'POST', null, null, {
      Cookie: `refresh_token=${tokenA}`
    });
    
    assert(refresh2.status === 401, 'Percobaan refresh menggunakan Token A lagi ditolak karena sudah di-revoke (invalid di DB)', '401', refresh2.status.toString());
    
    console.log(`\nResults: ${passCount} Passed, ${failCount} Failed`);
    
  } catch (e: any) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
