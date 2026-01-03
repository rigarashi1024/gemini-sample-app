/**
 * /api/answered-surveys のテスト
 * - GET: 回答済みアンケート一覧取得
 */

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

jest.mock('../../../src/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import { GET } from '@/app/api/answered-surveys/route';
import { prisma } from '@/lib/prisma';
import { createMockNextRequest, testData } from '../utils/testHelpers';

const prismaMock = prisma as DeepMockProxy<PrismaClient>;

describe('/api/answered-surveys', () => {
  describe('GET', () => {
    it('正常に回答済みアンケート一覧を取得できる', async () => {
      const responses = [
        {
          id: 'response-1',
          purposeId: 'purpose-123',
          createdAt: '2025-01-01T00:00:00.000Z',
          purpose: {
            id: 'purpose-123',
            title: 'テストアンケート1',
            description: '説明1',
            shareToken: 'token-1',
            deadline: null,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        },
        {
          id: 'response-2',
          purposeId: 'purpose-456',
          createdAt: '2025-01-02T00:00:00.000Z',
          purpose: {
            id: 'purpose-456',
            title: 'テストアンケート2',
            description: '説明2',
            shareToken: 'token-2',
            deadline: null,
            createdAt: '2025-01-02T00:00:00.000Z',
          },
        },
      ];
      prismaMock.response.findMany.mockResolvedValue(responses);

      const request = createMockNextRequest(
        'http://localhost:3000/api/answered-surveys?clientId=client-123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);
      expect(data[0].id).toBe('purpose-123');
      expect(data[1].id).toBe('purpose-456');
    });

    it('同じPurposeへの複数回答は重複除去される', async () => {
      const responses = [
        {
          id: 'response-1',
          purposeId: 'purpose-123',
          createdAt: '2025-01-01T00:00:00.000Z',
          purpose: {
            id: 'purpose-123',
            title: 'テストアンケート',
            description: '説明',
            shareToken: 'token-1',
            deadline: null,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        },
        {
          id: 'response-2',
          purposeId: 'purpose-123',
          createdAt: '2025-01-02T00:00:00.000Z',
          purpose: {
            id: 'purpose-123',
            title: 'テストアンケート',
            description: '説明',
            shareToken: 'token-1',
            deadline: null,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        },
      ];
      prismaMock.response.findMany.mockResolvedValue(responses);

      const request = createMockNextRequest(
        'http://localhost:3000/api/answered-surveys?clientId=client-123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].id).toBe('purpose-123');
    });

    it('clientIdが欠けている場合は400エラーを返す', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/answered-surveys');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('clientId is required');
    });

    it('DBエラー時に500エラーを返す', async () => {
      prismaMock.response.findMany.mockRejectedValue(new Error('DB Error'));

      const request = createMockNextRequest(
        'http://localhost:3000/api/answered-surveys?clientId=client-123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch answered surveys' });
    });
  });
});
