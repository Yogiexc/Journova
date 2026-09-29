const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Menyiapkan 3 Akun Uji Coba...');

  const passwordHash = await argon2.hash('Password123!');

  // 1. Author
  const author = await prisma.user.upsert({
    where: { email: 'author@test.com' },
    update: { password_hash: passwordHash },
    create: {
      email: 'author@test.com',
      password_hash: passwordHash,
      name: 'Budi Author',
      roles: {
        create: {
          role: {
            connectOrCreate: {
              where: { name: 'AUTHOR' },
              create: { name: 'AUTHOR' }
            }
          }
        }
      }
    }
  });
  console.log(`✅ Author siap: ${author.email} (Pass: Password123!)`);

  // 2. Reviewer
  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@test.com' },
    update: { password_hash: passwordHash },
    create: {
      email: 'reviewer@test.com',
      password_hash: passwordHash,
      name: 'Siti Reviewer',
      roles: {
        create: {
          role: {
            connectOrCreate: {
              where: { name: 'REVIEWER' },
              create: { name: 'REVIEWER' }
            }
          }
        }
      }
    }
  });
  console.log(`✅ Reviewer siap: ${reviewer.email} (Pass: Password123!)`);

  // 3. Editor
  const editor = await prisma.user.upsert({
    where: { email: 'editor@test.com' },
    update: { password_hash: passwordHash },
    create: {
      email: 'editor@test.com',
      password_hash: passwordHash,
      name: 'Tono Editor',
      roles: {
        create: {
          role: {
            connectOrCreate: {
              where: { name: 'EDITOR' },
              create: { name: 'EDITOR' }
            }
          }
        }
      }
    }
  });
  console.log(`✅ Editor siap: ${editor.email} (Pass: Password123!)`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
