import { Context } from '../types/context';
import { GraphQLError } from 'graphql';
import {
  hashPassword,
  comparePassword,
  generateToken,
} from '../utils/auth';
import {
  publisherRegisterSchema,
  createNewsSchema,
  updateNewsSchema,
} from '../utils/validation';
import { generateUniqueSlug } from '../utils/slug';

export const Mutation = {
  publisherLogin: async (
    _: any,
    { email, password }: { email: string; password: string },
    { prisma }: Context
  ) => {
    const publisher = await prisma.publisher.findUnique({
      where: { email },
    });

    if (!publisher) {
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'UNAUTHORIZED' },
      });
    }

    const valid = await comparePassword(password, publisher.password);

    if (!valid) {
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'UNAUTHORIZED' },
      });
    }

    const token = generateToken(publisher.id);

    return {
      token,
      publisher: {
        ...publisher,
        newsCount: await prisma.news.count({
          where: { publisherId: publisher.id },
        }),
      },
    };
  },

  publisherRegister: async (
    _: any,
    { input }: { input: any },
    { prisma }: Context
  ) => {
    const validatedInput = publisherRegisterSchema.parse(input);

    const existing = await prisma.publisher.findUnique({
      where: { email: validatedInput.email },
    });

    if (existing) {
      throw new GraphQLError('Email already registered', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const hashedPassword = await hashPassword(validatedInput.password);

    const publisher = await prisma.publisher.create({
      data: {
        email: validatedInput.email,
        password: hashedPassword,
        name: validatedInput.name,
        description: validatedInput.description,
        webhookUrl: validatedInput.webhookUrl,
      },
    });

    const token = generateToken(publisher.id);

    return {
      token,
      publisher: {
        ...publisher,
        newsCount: 0,
      },
    };
  },

  createNews: async (
    _: any,
    { input }: { input: any },
    { prisma, publisherId }: Context
  ) => {
    if (!publisherId) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const validatedInput = createNewsSchema.parse(input);

    const category = await prisma.category.findUnique({
      where: { id: validatedInput.categoryId },
    });

    if (!category) {
      throw new GraphQLError('Category not found');
    }

    const slug = await generateUniqueSlug(validatedInput.title, prisma);

    const news = await prisma.news.create({
      data: {
        ...validatedInput,
        slug,
        publisherId,
      },
      include: {
        publisher: true,
        category: true,
      },
    });

    return news;
  },

  updateNews: async (
    _: any,
    { id, input }: { id: string; input: any },
    { prisma, publisherId }: Context
  ) => {
    if (!publisherId) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const validatedInput = updateNewsSchema.parse(input);

    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      throw new GraphQLError('News not found');
    }

    if (existingNews.publisherId !== publisherId) {
      throw new GraphQLError('Not authorized to update this news', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    if (validatedInput.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedInput.categoryId },
      });

      if (!category) {
        throw new GraphQLError('Category not found');
      }
    }

    const updateData: any = { ...validatedInput };

    if (validatedInput.title && validatedInput.title !== existingNews.title) {
      updateData.slug = await generateUniqueSlug(
        validatedInput.title,
        prisma,
        id
      );
    }

    const news = await prisma.news.update({
      where: { id },
      data: updateData,
      include: {
        publisher: true,
        category: true,
      },
    });

    return news;
  },

  deleteNews: async (
    _: any,
    { id }: { id: string },
    { prisma, publisherId }: Context
  ) => {
    if (!publisherId) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new GraphQLError('News not found');
    }

    if (news.publisherId !== publisherId) {
      throw new GraphQLError('Not authorized to delete this news', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    await prisma.news.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'News deleted successfully',
    };
  },

  updateWebhook: async (
    _: any,
    { webhookUrl }: { webhookUrl: string },
    { prisma, publisherId }: Context
  ) => {
    if (!publisherId) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const publisher = await prisma.publisher.update({
      where: { id: publisherId },
      data: { webhookUrl },
    });

    return {
      ...publisher,
      newsCount: await prisma.news.count({
        where: { publisherId: publisher.id },
      }),
    };
  },
};