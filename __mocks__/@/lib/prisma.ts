import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export type MockPrisma = DeepMockProxy<PrismaClient>;

const prismaMock = mockDeep<PrismaClient>() as MockPrisma;

beforeEach(() => {
  mockReset(prismaMock);
});

export const prisma = prismaMock;
