import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users);

  const messages = await prisma.chat_message.findMany();
  console.log('Messages:', messages);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
