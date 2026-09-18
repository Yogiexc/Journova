import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Smoke Test Data ---');

  // 1. Create Journal
  const journal = await prisma.journal.create({
    data: {
      name: 'Journova Smoke Test Journal',
      slug: 'journova-smoke-test',
      status: 'ACTIVE',
    }
  });

  // 2. Create Volume & Issue
  const volume = await prisma.volume.create({
    data: {
      journal_id: journal.id,
      volume_number: 1,
      year: 2026,
    }
  });

  const issue = await prisma.issue.create({
    data: {
      journal_id: journal.id,
      volume_id: volume.id,
      issue_number: 1,
      year: 2026,
      status: 'PUBLISHED',
      published_at: new Date(),
    }
  });

  // 3. Create Categories & Keywords
  const category = await prisma.category.create({
    data: {
      journal_id: journal.id,
      name: 'Computer Science',
      slug: 'computer-science',
    }
  });

  const keyword = await prisma.keyword.create({
    data: {
      name: 'Artificial Intelligence',
      slug: 'artificial-intelligence',
    }
  });

  // 4. Create User & Author
  const user = await prisma.user.create({
    data: {
      name: 'Test Author',
      email: 'smoke.author@example.com',
      password_hash: 'dummyhash',
      status: 'ACTIVE',
    }
  });

  const author = await prisma.author.create({
    data: {
      user_id: user.id,
      full_name: 'Dr. Test Author',
      affiliation: 'Smoke Test University',
      country: 'ID',
      orcid: '0000-0000-0000-0000',
    }
  });

  // 5. Create Article
  const article = await prisma.article.create({
    data: {
      journal_id: journal.id,
      issue_id: issue.id,
      title: 'Smoke Test Published Article',
      slug: 'smoke-test-published-article',
      abstract: 'This is a smoke test article abstract.',
      status: 'PUBLISHED',
      published_at: new Date(),
      page_start: 1,
      page_end: 10,
      doi: '10.1234/smoke.test',
      authors: {
        create: [
          {
            author_id: author.id,
            author_order: 1,
            is_corresponding: true,
          }
        ]
      },
      categories: {
        create: [
          { category_id: category.id }
        ]
      },
      keywords: {
        create: [
          { keyword_id: keyword.id }
        ]
      }
    }
  });

  // 6. Create Draft Article (Should NOT appear in public APIs)
  const draftArticle = await prisma.article.create({
    data: {
      journal_id: journal.id,
      issue_id: issue.id, // linked to published issue!
      title: 'Smoke Test Draft Article',
      slug: 'smoke-test-draft-article',
      abstract: 'This is a draft article, should not be visible.',
      status: 'DRAFT',
      authors: {
        create: [
          {
            author_id: author.id,
            author_order: 1,
            is_corresponding: true,
          }
        ]
      }
    }
  });

  console.log('✅ Seeding complete!');
  console.log(`Published Article Slug: ${article.slug}`);
  console.log(`Draft Article Slug: ${draftArticle.slug}`);
  console.log(`Published Issue ID: ${issue.id}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
