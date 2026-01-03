/**
 * /api/share/[token] のテスト
 * - GET: shareTokenからPurpose取得
 */

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

jest.mock('../../../src/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import { GET } from '@/app/api/share/[token]/route';
import { prisma } from '@/lib/prisma';
import { createMockNextRequest, testData } from '../utils/testHelpers';

const prismaMock = prisma as DeepMockProxy<PrismaClient>;

describe('/api/share/[token]', () => {
  describe('GET', () => {
    it('正常にshareTokenからPurposeを取得できる', async () => {
      const purposeData = {
        id: testData.purpose.id,
        title: testData.purpose.title,
        description: testData.purpose.description,
        questions: testData.purpose.questions,
        deadline: testData.purpose.deadline,
        createdAt: testData.purpose.createdAt,
      };
      prismaMock.purpose.findUnique.mockResolvedValue(purposeData as any);

      const request = createMockNextRequest('http://localhost:3000/api/share/test-token-123');
      const response = await GET(request, { params: { token: 'test-token-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(purposeData);
      expect(prismaMock.purpose.findUnique).toHaveBeenCalledWith({
        where: { shareToken: 'test-token-123' },
        select: {
          id: true,
          title: true,
          description: true,
          questions: true,
          deadline: true,
          createdAt: true,
        },
      });
    });

    it('存在しないトークンの場合は404エラーを返す', async () => {
      prismaMock.purpose.findUnique.mockResolvedValue(null);

      const request = createMockNextRequest('http://localhost:3000/api/share/invalid-token');
      const response = await GET(request, { params: { token: 'invalid-token' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Purpose not found');
    });

    it('DBエラー時に500エラーを返す', async () => {
      prismaMock.purpose.findUnique.mockRejectedValue(new Error('DB Error'));

      const request = createMockNextRequest('http://localhost:3000/api/share/test-token-123');
      const response = await GET(request, { params: { token: 'test-token-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch purpose' });
    });
  });
});
