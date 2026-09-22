import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001/api/v1';
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const TEST_DIR = path.join(UPLOADS_DIR, 'test_articles');

async function setup() {
  console.log("1. Setting up test data via Prisma...");
  
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }

  // Create a dummy valid PDF file
  const validPdfPath = path.join(TEST_DIR, 'valid-test.pdf');
  fs.writeFileSync(validPdfPath, Buffer.from('%PDF-1.4\\nTest PDF content', 'utf8'));

  // Ensure journal/volume exists
  const journal = await prisma.journal.findFirst();
  const volume = await prisma.volume.findFirst();
  const user = await prisma.user.findFirst();

  // Create Issue 1 (PUBLISHED)
  const issue1 = await prisma.issue.create({
    data: {
      journal_id: journal!.id,
      volume_id: volume!.id,
      issue_number: Math.floor(Math.random() * 10000) + 900,
      title: 'Published Test Issue',
      month: 1,
      year: 2026,
      status: 'PUBLISHED',
      published_at: new Date()
    }
  });

  // Create Issue 2 (DRAFT)
  const issue2 = await prisma.issue.create({
    data: {
      journal_id: journal!.id,
      volume_id: volume!.id,
      issue_number: Math.floor(Math.random() * 10000) + 900,
      title: 'Draft Test Issue',
      month: 2,
      year: 2026,
      status: 'DRAFT'
    }
  });

  // Valid File Record
  const validFile = await prisma.file.create({
    data: {
      storage_provider: 'local',
      storage_key: 'test_articles/valid-test.pdf',
      original_name: 'test.pdf',
      mime_type: 'application/pdf',
      size: 100,
      uploaded_by: user!.id
    }
  });

  // Missing File Record
  const missingFile = await prisma.file.create({
    data: {
      storage_provider: 'local',
      storage_key: 'test_articles/missing.pdf',
      original_name: 'missing.pdf',
      mime_type: 'application/pdf',
      size: 100,
      uploaded_by: user!.id
    }
  });

  // Article 1 (PUBLISHED, real file)
  const a1 = await prisma.article.create({
    data: {
      journal_id: journal!.id,
      issue_id: issue1.id,
      title: 'Test 1 Published',
      slug: 'test-1-pub-' + Date.now(),
      abstract: 'Test 1',
      status: 'PUBLISHED',
      published_at: new Date(),
      publications: {
        create: {
          issue_id: issue1.id,
          file_id: validFile.id,
          version: 1
        }
      }
    }
  });

  // Article 2 (SCHEDULED)
  const a2 = await prisma.article.create({
    data: {
      journal_id: journal!.id,
      issue_id: issue1.id,
      title: 'Test 2 Scheduled',
      slug: 'test-2-sch-' + Date.now(),
      abstract: 'Test 2',
      status: 'SCHEDULED',
      publications: {
        create: {
          issue_id: issue1.id,
          file_id: validFile.id,
          version: 1
        }
      }
    }
  });

  // Article 3 (PUBLISHED, missing physical file)
  const a3 = await prisma.article.create({
    data: {
      journal_id: journal!.id,
      issue_id: issue1.id,
      title: 'Test 3 Missing File',
      slug: 'test-3-miss-' + Date.now(),
      abstract: 'Test 3',
      status: 'PUBLISHED',
      published_at: new Date(),
      publications: {
        create: {
          issue_id: issue1.id,
          file_id: missingFile.id,
          version: 1
        }
      }
    }
  });

  // Article 4 (PUBLISHED, but Issue is DRAFT)
  const a4 = await prisma.article.create({
    data: {
      journal_id: journal!.id,
      issue_id: issue2.id,
      title: 'Test 4 Draft Issue',
      slug: 'test-4-draft-issue-' + Date.now(),
      abstract: 'Test 4',
      status: 'PUBLISHED',
      published_at: new Date(),
      publications: {
        create: {
          issue_id: issue2.id,
          file_id: validFile.id,
          version: 1
        }
      }
    }
  });

  // Article 5 (DRAFT)
  const a5 = await prisma.article.create({
    data: {
      journal_id: journal!.id,
      title: 'Test 5 Draft Article',
      slug: 'test-5-draft-' + Date.now(),
      abstract: 'Test 5',
      status: 'DRAFT'
    }
  });

  return { a1, a2, a3, a4, a5 };
}

async function runTests() {
  const articles = await setup();
  
  console.log("\\n2. Running Tests...");
  let passed = true;

  // Test 1: Published Article + Real PDF -> 200, Content-Type, Content-Length, Magic Bytes
  console.log("\\nTest 1: Published PDF (Happy Path)");
  const res1 = await fetch(`${API_URL}/articles/${articles.a1.slug}/pdf`);
  if (res1.status !== 200) {
    console.error(`❌ Expected 200, got ${res1.status}`);
    const text = await res1.text();
    console.error('Response:', text);
    passed = false;
  } else {
    const contentType = res1.headers.get('content-type');
    const contentDisp = res1.headers.get('content-disposition');
    
    if (contentType !== 'application/pdf') {
      console.error(`❌ Expected Content-Type application/pdf, got ${contentType}`);
      passed = false;
    }
    if (!contentDisp || !contentDisp.includes(`inline; filename="${articles.a1.slug}.pdf"`)) {
      console.error(`❌ Expected inline Content-Disposition, got ${contentDisp}`);
      passed = false;
    }

    const buffer = await res1.arrayBuffer();
    if (buffer.byteLength === 0) {
      console.error("❌ Expected Content-Length > 0");
      passed = false;
    }

    const magic = Buffer.from(buffer).toString('utf8', 0, 5);
    if (magic !== '%PDF-') {
      console.error(`❌ Expected magic bytes %PDF-, got ${magic}`);
      passed = false;
    }
    
    if (passed) console.log("✅ Passed");
  }

  // Test 2: Draft Article
  console.log("\\nTest 2: Draft Article -> 404");
  const res2 = await fetch(`${API_URL}/articles/${articles.a5.slug}/pdf`);
  if (res2.status !== 404) {
    console.error(`❌ Expected 404, got ${res2.status}`);
    passed = false;
  } else console.log("✅ Passed");

  // Test 3: Scheduled Article
  console.log("\\nTest 3: Scheduled Article -> 404");
  const res3 = await fetch(`${API_URL}/articles/${articles.a2.slug}/pdf`);
  if (res3.status !== 404) {
    console.error(`❌ Expected 404, got ${res3.status}`);
    passed = false;
  } else console.log("✅ Passed");

  // Test 4: Published Article, Draft Issue
  console.log("\\nTest 4: Published Article but Draft Issue -> 404");
  const res4 = await fetch(`${API_URL}/articles/${articles.a4.slug}/pdf`);
  if (res4.status !== 404) {
    console.error(`❌ Expected 404, got ${res4.status}`);
    passed = false;
  } else console.log("✅ Passed");

  // Test 5: Missing Physical File
  console.log("\\nTest 5: Missing Physical File -> 404");
  const res5 = await fetch(`${API_URL}/articles/${articles.a3.slug}/pdf`);
  if (res5.status !== 404) {
    console.error(`❌ Expected 404, got ${res5.status}`);
    passed = false;
  } else console.log("✅ Passed");

  if (passed) {
    console.log("\\n🎉 ALL TESTS PASSED E2E!");
  } else {
    console.error("\\n❌ SOME TESTS FAILED.");
    process.exit(1);
  }
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
