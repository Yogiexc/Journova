
import { PrismaService } from './src/prisma/prisma.service.js';
import { DoiService } from './src/doi/doi.service.js';
import { IssuesService } from './src/issues/issues.service.js';
import { DoiDepositStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  console.log('1. Bootstrapping Services manually...');
  const prisma = new PrismaService();
  const doiService = new DoiService(prisma);
  const issuesService = new IssuesService(prisma, doiService);

  console.log('2. Preparing Test Data...');
  const journal = await prisma.journal.findFirst();
  const volume = await prisma.volume.findFirst();
  const user = await prisma.user.findFirst();

  // Clean up any old test data
  const oldIssues = await prisma.issue.findMany({ where: { title: 'DOI Test Issue' } });
  for (const oi of oldIssues) {
    const oldArticles = await prisma.article.findMany({ where: { issue_id: oi.id } });
    for (const oa of oldArticles) {
      await prisma.publicationRecord.deleteMany({ where: { article_id: oa.id } });
      await prisma.doiDeposit.deleteMany({ where: { article_id: oa.id } });
    }
    await prisma.article.deleteMany({ where: { issue_id: oi.id } });
  }
  await prisma.issue.deleteMany({ where: { title: 'DOI Test Issue' } });

  // Create Issue
  const issue = await prisma.issue.create({
    data: {
      journal_id: journal!.id,
      volume_id: volume!.id,
      issue_number: 999,
      title: 'DOI Test Issue',
      month: 9,
      year: 2026,
      status: 'DRAFT'
    }
  });

  // Create Article
  const article = await prisma.article.create({
    data: {
      journal_id: journal!.id,
      issue_id: issue.id,
      title: 'DOI Test Article',
      slug: 'doi-test-' + Date.now(),
      status: 'SCHEDULED',
      page_start: 1,
      page_end: 10,
    }
  });

  // Create mock physical file
  const testDir = path.join(process.cwd(), 'uploads/test_articles');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(path.join(testDir, 'dummy.pdf'), Buffer.from('%PDF-dummy'));

  // File & PublicationRecord
  const file = await prisma.file.create({
    data: {
      storage_provider: 'local',
      storage_key: 'test_articles/dummy.pdf',
      original_name: 'dummy.pdf',
      mime_type: 'application/pdf',
      size: 100,
      uploaded_by: user!.id
    }
  });

  await prisma.publicationRecord.create({
    data: {
      article_id: article.id,
      issue_id: issue.id,
      file_id: file.id,
      version: 1,
      page_start: 1,
      page_end: 10
    }
  });

  console.log('3. Publishing Issue (Triggers async DOI Registration)...');
  await issuesService.publishIssue(issue.id);

  console.log('4. Waiting for async deposit (10 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('5. Verifying DoiDeposit record created as SUBMITTED...');
  let deposits = await prisma.doiDeposit.findMany({ where: { article_id: article.id } });
  if (deposits.length === 0) {
    console.error('❌ No DOI Deposit record found!');
    process.exit(1);
  }
  let deposit = deposits[0];
  console.log(`Deposit Status: ${deposit.status}`);
  if (deposit.status !== 'SUBMITTED' && deposit.status !== 'SUCCESS') {
    console.error('❌ Deposit status is not SUBMITTED/SUCCESS');
    process.exit(1);
  }

  console.log('6. Waiting for mock polling to complete (additional 4 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 4000));

  console.log('7. Verifying final DOI Registration...');
  const updatedArticle = await prisma.article.findUnique({ where: { id: article.id }, include: { doi_deposits: true } });
  deposit = updatedArticle!.doi_deposits[0];
  
  if (deposit.status === 'SUCCESS' && updatedArticle!.doi) {
    console.log(`✅ DOI Registration Successful!`);
    console.log(`DOI Assigned: ${updatedArticle!.doi}`);
  } else {
    console.error(`❌ DOI Registration Failed. Status: ${deposit.status}`);
    process.exit(1);
  }

  console.log('\\n🎉 All DOI registration E2E tests passed!');
  process.exit(0);
}

bootstrap();
