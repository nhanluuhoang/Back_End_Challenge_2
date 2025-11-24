import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest in technology and innovation',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: 'Business',
        slug: 'business',
        description: 'Business and finance news',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports updates and highlights',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'entertainment' },
      update: {},
      create: {
        name: 'Entertainment',
        slug: 'entertainment',
        description: 'Entertainment and celebrity news',
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create publishers
  const hashedPassword = await bcrypt.hash('password123', 10);

  const publisher1 = await prisma.publisher.upsert({
    where: { email: 'techpub@example.com' },
    update: {},
    create: {
      email: 'techpub@example.com',
      password: hashedPassword,
      name: 'Tech Publishing Co.',
      description: 'Leading technology news publisher',
      webhookUrl: 'https://webhook.site/tech-publisher',
    },
  });

  const publisher2 = await prisma.publisher.upsert({
    where: { email: 'newscorp@example.com' },
    update: {},
    create: {
      email: 'newscorp@example.com',
      password: hashedPassword,
      name: 'Global News Corporation',
      description: 'International news coverage',
      webhookUrl: 'https://webhook.site/global-news',
    },
  });

  console.log('✅ Publishers created');

  // Create news articles
  await prisma.news.createMany({
    data: [
      {
        title: 'AI Revolution in 2025: What to Expect',
        slug: 'ai-revolution-2025',
        content: 'Artificial Intelligence continues to reshape industries across the globe. From healthcare to finance, AI is transforming how we work and live. This comprehensive guide explores the latest developments and what to expect in the coming years.',
        excerpt: 'The latest developments in AI technology',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
        published: true,
        publisherId: publisher1.id,
        categoryId: categories[0].id,
      },
      {
        title: 'Global Markets Hit Record Highs',
        slug: 'global-markets-record-highs',
        content: 'Stock markets around the world reached new peaks today as investors showed renewed confidence in the global economy. The surge was driven by strong corporate earnings and positive economic indicators.',
        excerpt: 'Economic indicators show strong growth',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
        published: true,
        publisherId: publisher2.id,
        categoryId: categories[1].id,
      },
      {
        title: 'Championship Finals: An Epic Showdown',
        slug: 'championship-finals-epic-showdown',
        content: 'The most anticipated sports event of the year is finally here. Two powerhouse teams will face off in what promises to be an unforgettable championship final. Expert analysis and predictions inside.',
        excerpt: 'Teams prepare for the ultimate battle',
        imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
        published: true,
        publisherId: publisher2.id,
        categoryId: categories[2].id,
      },
      {
        title: 'New Blockbuster Breaks Box Office Records',
        slug: 'blockbuster-breaks-records',
        content: 'The latest superhero film shattered expectations at the box office this weekend, becoming the highest-grossing opening of the year. Audiences worldwide are flocking to theaters to experience the epic conclusion to the beloved franchise.',
        excerpt: 'Cinema audiences flock to theaters',
        imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
        published: true,
        publisherId: publisher1.id,
        categoryId: categories[3].id,
      },
      {
        title: 'Draft: Upcoming Tech Conference Announcement',
        slug: 'draft-tech-conference-announcement',
        content: 'We are excited to announce our annual tech conference, bringing together industry leaders, innovators, and developers from around the world. Stay tuned for more details on speakers and sessions.',
        excerpt: 'Save the date for the biggest tech event',
        published: false,
        publisherId: publisher1.id,
        categoryId: categories[0].id,
      },
    ],
  });

  console.log('✅ News articles created');
  console.log('\n📧 Test credentials:');
  console.log('Email: techpub@example.com');
  console.log('Email: newscorp@example.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });