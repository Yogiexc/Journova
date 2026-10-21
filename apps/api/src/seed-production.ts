import { PrismaClient, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Production Base Data ---');

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
  console.log('✅ Roles initialized: ADMIN, EDITOR, REVIEWER, AUTHOR');

  // 2. Default Initial Users with Argon2 Hash
  const defaultPassword = 'Password123!';
  const passwordHash = await argon2.hash(defaultPassword);

  const initialUsers = [
    {
      name: 'Super Admin',
      email: 'admin@journova.com',
      role: 'ADMIN',
    },
    {
      name: 'Tono Editor',
      email: 'editor@test.com',
      role: 'EDITOR',
    },
    {
      name: 'Siti Reviewer',
      email: 'reviewer@test.com',
      role: 'REVIEWER',
    },
    {
      name: 'Budi Author',
      email: 'author@test.com',
      role: 'AUTHOR',
    },
  ];

  for (const u of initialUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
      },
      create: {
        name: u.name,
        email: u.email,
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
      },
    });

    const targetRole = roleMap[u.role];
    if (targetRole) {
      await prisma.userRole.upsert({
        where: { user_id_role_id: { user_id: user.id, role_id: targetRole.id } },
        update: {},
        create: {
          user_id: user.id,
          role_id: targetRole.id,
        },
      });
    }
  }
  console.log('✅ Base Production Users created/updated with password: Password123!');

  // 3. Official Journova Journal
  const journal = await prisma.journal.upsert({
    where: { slug: 'journova-digital-innovation' },
    update: {},
    create: {
      name: 'Journova Journal of Digital Innovation',
      slug: 'journova-digital-innovation',
      description: 'An open-access peer-reviewed journal focusing on state-of-the-art digital innovation, artificial intelligence, and software engineering.',
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

  await prisma.issue.upsert({
    where: { volume_id_issue_number: { volume_id: volume.id, issue_number: 1 } },
    update: {},
    create: {
      journal_id: journal.id,
      volume_id: volume.id,
      issue_number: 1,
      title: 'Inaugural Issue',
      month: 10,
      year: 2026,
      status: 'PUBLISHED',
      published_at: new Date(),
    },
  });

  console.log('✅ Official Journal & Volume/Issue ready.');
  console.log('--- Production Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
