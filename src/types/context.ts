import { PrismaClient } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
  publisherId?: string;
}

export interface JWTPayload {
  publisherId: string;
}