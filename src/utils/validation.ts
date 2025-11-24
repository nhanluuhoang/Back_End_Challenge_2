import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

export const publisherRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  webhookUrl: z.string().url().optional(),
});

export const createNewsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  excerpt: z.string().optional(),
  imageUrl: z.string().url().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  published: z.boolean().default(false),
});

export const updateNewsSchema = z.object({
  title: z.string().min(5).optional(),
  content: z.string().min(20).optional(),
  excerpt: z.string().optional(),
  imageUrl: z.string().url().optional(),
  categoryId: z.string().uuid().optional(),
  published: z.boolean().optional(),
});