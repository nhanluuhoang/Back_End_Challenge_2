import { Context } from '../types/context';
import { GraphQLError } from 'graphql';
import { triggerWebhook } from '../utils/webhook';

export interface NewsArgs {
  search?: string;
  categoryId?: string;
  publisherId?: string;
  published?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface NewsDetailArgs {
  id?: string;
  slug?: string;
}

export interface MyNewsArgs {
  page?: number;
  limit?: number;
  published?: boolean;
}

export const Query = {
  news: async (_: any, args: NewsArgs, { prisma }: Context) => {
    const {
      search,
      categoryId,
      publisherId,
      published = true,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = args;

    const skip = (page - 1) * limit;

    const where: any = { published };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (publisherId) where.publisherId = publisherId;

    const [nodes, totalCount] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          publisher: true,
          category: true,
        },
      }),
      prisma.news.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      nodes,
      totalCount,
      pageInfo: {
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        currentPage: page,
        totalPages,
      },
    };
  },

  newsDetail: async (_: any, args: NewsDetailArgs, { prisma }: Context) => {
    const { id, slug } = args;

    if (!id && !slug) {
      throw new GraphQLError('Either id or slug must be provided');
    }

    const news = await prisma.news.findFirst({
      where: id ? { id } : { slug },
      include: {
        publisher: true,
        category: true,
      },
    });

    if (!news) {
      throw new GraphQLError('News not found');
    }

    // Increment view count and trigger webhook
    const updatedNews = await prisma.news.update({
      where: { id: news.id },
      data: { viewCount: { increment: 1 } },
      include: {
        publisher: true,
        category: true,
      },
    });

    // Trigger webhook asynchronously
    triggerWebhook(updatedNews.publisher, updatedNews).catch(console.error);

    return updatedNews;
  },

  categories: async (_: any, __: any, { prisma }: Context) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return Promise.all(
      categories.map(async (category) => ({
        ...category,
        newsCount: await prisma.news.count({
          where: { categoryId: category.id, published: true },
        }),
      }))
    );
  },

  publishers: async (_: any, __: any, { prisma }: Context) => {
    const publishers = await prisma.publisher.findMany({
      orderBy: { name: 'asc' },
    });

    return Promise.all(
      publishers.map(async (publisher) => ({
        ...publisher,
        newsCount: await prisma.news.count({
          where: { publisherId: publisher.id, published: true },
        }),
      }))
    );
  },

  myNews: async (_: any, args: MyNewsArgs, { prisma, publisherId }: Context) => {
    if (!publisherId) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const { page = 1, limit = 10, published } = args;
    const skip = (page - 1) * limit;

    const where: any = { publisherId };
    if (published !== undefined) where.published = published;

    const [nodes, totalCount] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          publisher: true,
          category: true,
        },
      }),
      prisma.news.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      nodes,
      totalCount,
      pageInfo: {
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        currentPage: page,
        totalPages,
      },
    };
  },

  me: async (_: any, __: any, { prisma, publisherId }: Context) => {
    if (!publisherId) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const publisher = await prisma.publisher.findUnique({
      where: { id: publisherId },
    });

    if (!publisher) {
      throw new GraphQLError('Publisher not found');
    }

    return {
      ...publisher,
      newsCount: await prisma.news.count({
        where: { publisherId: publisher.id },
      }),
    };
  },
};