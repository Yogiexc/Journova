import { PrismaClient, UserStatus, IssueStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'System Administrator' },
  });
  const editorRole = await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: { name: 'EDITOR', description: 'Journal Editor' },
  });
  const reviewerRole = await prisma.role.upsert({
    where: { name: 'REVIEWER' },
    update: {},
    create: { name: 'REVIEWER', description: 'Peer Reviewer' },
  });
  const authorRole = await prisma.role.upsert({
    where: { name: 'AUTHOR' },
    update: {},
    create: { name: 'AUTHOR', description: 'Article Author' },
  });

  // 2. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@journova.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@journova.com',
      password_hash: 'hashed_password_here', // To be updated with bcrypt hash later
      status: UserStatus.ACTIVE,
      roles: {
        create: [{ role_id: adminRole.id }],
      },
    },
  });

  // 3. Dummy Journal
  const journal = await prisma.journal.upsert({
    where: { slug: 'journova-digital-innovation' },
    update: {},
    create: {
      name: 'Journova Journal of Digital Innovation',
      slug: 'journova-digital-innovation',
      description: 'An open-access peer-reviewed journal focusing on digital innovation.',
      issn: '1234-5678',
      publisher: 'Journova Press',
      status: 'ACTIVE',
    },
  });

  // 4. Dummy Volume & Issue
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
      title: 'Inaugural Issue',
      month: 9,
      year: 2026,
      status: IssueStatus.PUBLISHED,
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
