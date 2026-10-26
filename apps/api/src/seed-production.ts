import { PrismaClient, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Rich Production Sample Data ---');

  // 1. Roles
  const roles = [
    { name: 'ADMIN', description: 'System Administrator' },
    { name: 'EDITOR', description: 'Journal Editor' },
    { name: 'REVIEWER', description: 'Peer Reviewer' },
    { name: 'AUTHOR', description: 'Article Author' },
  ];

  const roleMap: Record<string, any> = {};
  for (const r of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    roleMap[r.name] = createdRole;
  }

  // 2. Users (Admin vs Ephemeral Sandbox Personas)
  const demoPassword = 'Password123!';
  const demoPasswordHash = await argon2.hash(demoPassword);

  // In production, ADMIN_INITIAL_PASSWORD should be set via environment variable
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Password123!';
  const adminPasswordHash = await argon2.hash(adminPassword);

  const initialUsers = [
    { name: 'Super Admin', email: 'admin@journova.com', role: 'ADMIN', is_admin: true },
    { name: 'Tono Editor', email: 'editor@test.com', role: 'EDITOR', is_admin: false },
    { name: 'Siti Reviewer', email: 'reviewer@test.com', role: 'REVIEWER', is_admin: false },
    { name: 'Budi Author', email: 'author@test.com', role: 'AUTHOR', is_admin: false },
    { name: 'Dr. Sarah Connor', email: 'sarah.author@test.com', role: 'AUTHOR', is_admin: false },
    { name: 'Prof. Alan Turing', email: 'alan.reviewer@test.com', role: 'REVIEWER', is_admin: false },
  ];

  const userMap: Record<string, any> = {};
  for (const u of initialUsers) {
    const hash = u.is_admin ? adminPasswordHash : demoPasswordHash;
    
    // Safety: If the user already exists in production, do NOT clobber their existing password hash
    // unless explicitly instructed via FORCE_PASSWORD_RESET=true
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    const updateData: any = { status: UserStatus.ACTIVE };
    if (process.env.FORCE_PASSWORD_RESET === 'true' || !existing) {
      updateData.password_hash = hash;
    }

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: updateData,
      create: { name: u.name, email: u.email, password_hash: hash, status: UserStatus.ACTIVE },
    });
    userMap[u.email] = user;

    const targetRole = roleMap[u.role];
    if (targetRole) {
      await prisma.userRole.upsert({
        where: { user_id_role_id: { user_id: user.id, role_id: targetRole.id } },
        update: {},
        create: { user_id: user.id, role_id: targetRole.id },
      });
    }
  }

  // 3. Official Journal
  const journal = await prisma.journal.upsert({
    where: { slug: 'journova-digital-innovation' },
    update: {},
    create: {
      name: 'Journova Journal of Digital Innovation',
      slug: 'journova-digital-innovation',
      description: 'An international open-access peer-reviewed journal publishing transformative research across digital systems, artificial intelligence, and scalable software architectures.',
      issn: '2775-8899',
      publisher: 'Journova Press',
      doi_prefix: '10.5555',
      status: 'ACTIVE',
    },
  });

  // 4. Volume & Issue
  const volume = await prisma.volume.upsert({
    where: { journal_id_volume_number: { journal_id: journal.id, volume_number: 1 } },
    update: {},
    create: {
      journal_id: journal.id,
      volume_number: 1,
      year: 2026,
      title: 'Volume 1 (2026)',
    },
  });

  const issue = await prisma.issue.upsert({
    where: { volume_id_issue_number: { volume_id: volume.id, issue_number: 1 } },
    update: {},
    create: {
      journal_id: journal.id,
      volume_id: volume.id,
      issue_number: 1,
      title: 'Inaugural Issue: Advances in Scalable Intelligent Systems',
      month: 10,
      year: 2026,
      status: 'PUBLISHED',
      published_at: new Date(),
    },
  });

  // 5. Rich Published Sample Articles
  const sampleArticles = [
    {
      title: 'Architecting Resilient Distributed Systems with Event-Driven NestJS',
      slug: 'architecting-resilient-distributed-systems',
      abstract: 'Modern web architectures require fault-tolerant distributed communication. This study examines transactional outbox patterns, message broker clustering, and dual-provider object storage resilience in mission-critical applications.',
      doi: '10.5555/journova.v1.i1.architecting-resilient-distributed-systems',
      page_start: '1',
      page_end: '18',
    },
    {
      title: 'Next-Generation Academic Publishing: Zero-CORS Proxies and Federated Scholarly Metadata',
      slug: 'next-gen-academic-publishing-zero-cors',
      abstract: 'Academic preprint distribution often struggles with Cross-Origin resource constraints and fragmented metadata schemas. We propose a decoupled reverse-proxy pipeline compliant with Crossref Schema 4.4.2.',
      doi: '10.5555/journova.v1.i1.next-gen-academic-publishing-zero-cors',
      page_start: '19',
      page_end: '34',
    },
    {
      title: 'Deep Learning Optimizations for Automated Peer Reviewer Matching in Scientific Journals',
      slug: 'deep-learning-automated-peer-reviewer-matching',
      abstract: 'Assigning qualified peer reviewers is an editorial bottleneck. We benchmark semantic embedding models on scholarly abstracts to increase assignment fairness and double-blind adherence.',
      doi: '10.5555/journova.v1.i1.deep-learning-automated-peer-reviewer-matching',
      page_start: '35',
      page_end: '52',
    },
  ];

  for (const art of sampleArticles) {
    const createdArticle = await prisma.article.upsert({
      where: { slug: art.slug },
      update: {
        issue_id: issue.id,
        status: 'PUBLISHED',
        published_at: new Date(),
      },
      create: {
        journal_id: journal.id,
        issue_id: issue.id,
        title: art.title,
        slug: art.slug,
        abstract: art.abstract,
        doi: art.doi,
        status: 'PUBLISHED',
        published_at: new Date(),
      },
    });

    // Author link
    const authorUser = userMap['author@test.com'];
    if (authorUser) {
      const existingAuthor = await prisma.author.findFirst({ where: { user_id: authorUser.id } });
      const authorId = existingAuthor ? existingAuthor.id : (await prisma.author.create({
        data: {
          user_id: authorUser.id,
          full_name: 'Budi Santoso, Ph.D.',
          affiliation: 'Institute of Advanced Computer Systems',
        }
      })).id;

      await prisma.articleAuthor.upsert({
        where: { article_id_author_id: { article_id: createdArticle.id, author_id: authorId } },
        update: {},
        create: {
          article_id: createdArticle.id,
          author_id: authorId,
          author_order: 1,
        },
      });

      // Attach Published PDF File & PublicationRecord
      const editorUser = userMap['editor@test.com'];
      const fileRecord = await prisma.file.create({
        data: {
          storage_provider: 'mock',
          storage_key: `mock/publications/${createdArticle.slug}.pdf`,
          original_name: `${createdArticle.slug}.pdf`,
          mime_type: 'application/pdf',
          size: 1024 * 512,
          uploaded_by: editorUser ? editorUser.id : authorUser.id,
        }
      });

      await prisma.publicationRecord.create({
        data: {
          article_id: createdArticle.id,
          issue_id: issue.id,
          file_id: fileRecord.id,
          version: 1,
        }
      });
    }
  }

  // 6. Active Sample Submissions for Editor and Reviewer Workspace
  const reviewArticle = await prisma.article.upsert({
    where: { slug: 'evaluating-zk-proofs-academic-credentialing' },
    update: {},
    create: {
      journal_id: journal.id,
      title: 'Evaluating Zero-Knowledge Cryptographic Proofs for Decentralized Academic Credentialing',
      slug: 'evaluating-zk-proofs-academic-credentialing',
      abstract: 'Decentralized identity verification in scientific peer review ensures anonymous accountability without sacrificing contributor integrity. This paper details a novel zk-SNARK protocol tailored for academic peer reviews.',
      status: 'UNDER_REVIEW',
    },
  });

  await prisma.submission.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      article_id: reviewArticle.id,
      submitted_by: userMap['author@test.com'].id,
      status: 'UNDER_REVIEW',
      submitted_at: new Date(),
    },
  });

  console.log('✅ Rich Articles, Issues, Authors, and Submissions initialized.');
  console.log('--- Rich Sample Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
