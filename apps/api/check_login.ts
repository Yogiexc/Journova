import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({ where: { email: 'editor1@journova.local' } });
  if (!user) {
    console.log('User not found!');
  } else {
    console.log('User found:', user.email);
    console.log('Hash:', user.password_hash);
    const valid = await argon2.verify(user.password_hash, 'editorpassword');
    console.log('Is valid?', valid);
  }
}

check().finally(() => prisma.$disconnect());
