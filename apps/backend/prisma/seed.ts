import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
    },
  });

  await prisma.article.createMany({
    data: [
      {
        title: 'Getting Started with TypeScript',
        content: 'TypeScript is a powerful superset of JavaScript that adds static typing...',
        summary: 'A comprehensive guide to TypeScript basics',
        published: true,
        authorId: user1.id,
      },
      {
        title: 'React Best Practices',
        content: 'React is a popular library for building user interfaces...',
        summary: 'Essential patterns and practices for React development',
        published: true,
        authorId: user2.id,
      },
      {
        title: 'Draft Article',
        content: 'This is a draft article that is not yet published...',
        summary: 'A draft article for testing purposes',
        published: false,
        authorId: user1.id,
      },
    ],
  });

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });