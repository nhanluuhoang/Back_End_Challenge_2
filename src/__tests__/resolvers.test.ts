import { PrismaClient } from '@prisma/client';
import { Query } from '../resolvers/query';
import { Mutation } from '../resolvers/mutation';
import { Context } from '../types/context';

const prisma = new PrismaClient();

describe('Resolvers', () => {
  let testPublisherId: string;
  let testCategoryId: string;
  let testNewsId: string;

  beforeAll(async () => {
    // Setup test data
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category-' + Date.now(),
        description: 'Test description',
      },
    });
    testCategoryId = category.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.news.deleteMany({
      where: { publisher: { email: 'test@example.com' } },
    });
    await prisma.publisher.deleteMany({
      where: { email: 'test@example.com' },
    });
    await prisma.category.deleteMany({
      where: { slug: { startsWith: 'test-category-' } },
    });
    await prisma.$disconnect();
  });

  describe('Mutation.publisherRegister', () => {
    it('should register a new publisher', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test Publisher',
        description: 'Test description',
      };

      const context: Context = { prisma };
      const result = await Mutation.publisherRegister(
        null,
        { input },
        context
      );

      expect(result.token).toBeDefined();
      expect(result.publisher.email).toBe(input.email);
      expect(result.publisher.name).toBe(input.name);
      
      testPublisherId = result.publisher.id;
    });

    it('should throw error for duplicate email', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test Publisher 2',
      };

      const context: Context = { prisma };
      
      await expect(
        Mutation.publisherRegister(null, { input }, context)
      ).rejects.toThrow();
    });
  });

  describe('Mutation.publisherLogin', () => {
    it('should login with correct credentials', async () => {
      const context: Context = { prisma };
      const result = await Mutation.publisherLogin(
        null,
        { email: 'test@example.com', password: 'password123' },
        context
      );

      expect(result.token).toBeDefined();
      expect(result.publisher.email).toBe('test@example.com');
    });

    it('should throw error for wrong password', async () => {
      const context: Context = { prisma };
      
      await expect(
        Mutation.publisherLogin(
          null,
          { email: 'test@example.com', password: 'wrongpassword' },
          context
        )
      ).rejects.toThrow();
    });
  });

  describe('Mutation.createNews', () => {
    it('should create news when authenticated', async () => {
      const input = {
        title: 'Test News Article',
        content: 'This is a test news article with enough content.',
        excerpt: 'Test excerpt',
        categoryId: testCategoryId,
        published: true,
      };

      const context: Context = {
        prisma,
        publisherId: testPublisherId,
      };

      const result = await Mutation.createNews(null, { input }, context);

      expect(result.title).toBe(input.title);
      expect(result.slug).toBeDefined();
      expect(result.publisherId).toBe(testPublisherId);
      
      testNewsId = result.id;
    });

    it('should throw error when not authenticated', async () => {
      const input = {
        title: 'Test News',
        content: 'Test content that is long enough for validation',
        categoryId: testCategoryId,
      };

      const context: Context = { prisma };

      await expect(
        Mutation.createNews(null, { input }, context)
      ).rejects.toThrow('Authentication required');
    });
  });

  describe('Query.news', () => {
    it('should return paginated news list', async () => {
      const context: Context = { prisma };
      const result = await Query.news(
        null,
        { page: 1, limit: 10 },
        context
      );

      expect(result.nodes).toBeDefined();
      expect(Array.isArray(result.nodes)).toBe(true);
      expect(result.totalCount).toBeGreaterThanOrEqual(0);
      expect(result.pageInfo).toBeDefined();
    });

    it('should filter by category', async () => {
      const context: Context = { prisma };
      const result = await Query.news(
        null,
        { categoryId: testCategoryId, page: 1, limit: 10 },
        context
      );

      expect(result.nodes.every((n: any) => n.categoryId === testCategoryId)).toBe(true);
    });

    it('should search news', async () => {
      const context: Context = { prisma };
      const result = await Query.news(
        null,
        { search: 'Test', page: 1, limit: 10 },
        context
      );

      expect(result.nodes).toBeDefined();
    });
  });

  describe('Query.categories', () => {
    it('should return all categories', async () => {
      const context: Context = { prisma };
      const result = await Query.categories(null, {}, context);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].newsCount).toBeDefined();
    });
  });

  describe('Mutation.updateNews', () => {
    it('should update own news', async () => {
      const input = {
        title: 'Updated Test News Article',
        published: false,
      };

      const context: Context = {
        prisma,
        publisherId: testPublisherId,
      };

      const result = await Mutation.updateNews(
        null,
        { id: testNewsId, input },
        context
      );

      expect(result.title).toBe(input.title);
      expect(result.published).toBe(false);
    });

    it('should not update other publisher news', async () => {
      const input = { title: 'Hacked Title' };
      const context: Context = {
        prisma,
        publisherId: 'different-publisher-id',
      };

      await expect(
        Mutation.updateNews(null, { id: testNewsId, input }, context)
      ).rejects.toThrow();
    });
  });

  describe('Mutation.deleteNews', () => {
    it('should delete own news', async () => {
      const context: Context = {
        prisma,
        publisherId: testPublisherId,
      };

      const result = await Mutation.deleteNews(
        null,
        { id: testNewsId },
        context
      );

      expect(result.success).toBe(true);
    });
  });
});