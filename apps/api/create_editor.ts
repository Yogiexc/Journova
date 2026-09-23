import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = 'author1@journova.local';
  const password = 'authorpassword';
  const password_hash = await argon2.hash(password);

  // Upsert the user
  const user = await prisma.user.upsert({
    where: { email },
    update: { password_hash },
    create: {
      email,
      name: 'Super Author',
      password_hash,
      status: 'ACTIVE',
    },
  });

  // Ensure AUTHOR role
  const role = await prisma.role.upsert({
    where: { name: 'AUTHOR' },
    update: {},
    create: { name: 'AUTHOR', description: 'Journal Author' }
  });

  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: user.id, role_id: role.id } },
    update: {},
    create: { user_id: user.id, role_id: role.id }
  });

  console.log('✅ Account created/updated successfully!');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: AUTHOR`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
