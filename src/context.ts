import { PrismaClient } from '@prisma/client';
import { Context } from './types/context';
import { extractToken, verifyToken } from './utils/auth';

const prisma = new PrismaClient();

export const createContext = async ({
  req,
}: {
  req: any;
}): Promise<Context> => {
  const token = extractToken(req.headers.authorization);

  let publisherId: string | undefined;

  if (token) {
    try {
      const decoded = verifyToken(token);
      publisherId = decoded.publisherId;
    } catch (error) {
      // Invalid token - continue without auth
    }
  }

  return {
    prisma,
    publisherId,
  };
};

export { prisma };