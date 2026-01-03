/**
 * /api/purposes のテスト
 * - GET: Purpose一覧取得（期限切れ除外、createdByフィルタ）
 * - POST: Purpose作成（バリデーション、shareToken生成、deadline処理）
 */

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

jest.mock('../../../src/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import { GET, POST } from '@/app/api/purposes/route';
import { prisma } from '@/lib/prisma';
import { createMockNextRequest, testData } from '../utils/testHelpers';

const prismaMock = prisma as DeepMockProxy<PrismaClient>;

describe('/api/purposes', () => {
  describe('GET', () => {
    it('期限切れでないPurpose一覧を取得できる', async () => {
      const purposes = [
        {
          ...testData.purpose,
          _count: { responses: 5 },
        },
      ];

      prismaMock.purpose.findMany.mockResolvedValue(purposes);

      const request = createMockNextRequest('http://localhost:3000/api/purposes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(purposes);
      expect(prismaMock.purpose.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { deadline: null },
                { deadline: { gte: expect.any(Date) } },
              ],
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          shareToken: true,
          deadline: true,
          createdAt: true,
          _count: { select: { responses: true } },
        },
      });
    });

    it('createdByパラメータでフィルタリングできる', async () => {
      prismaMock.purpose.findMany.mockResolvedValue([]);

      const request = createMockNextRequest(
        'http://localhost:3000/api/purposes?createdBy=client-123'
      );
      await GET(request);

      expect(prismaMock.purpose.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              { createdBy: 'client-123' },
            ]),
          },
        })
      );
    });

    it('DBエラー時に500エラーを返す', async () => {
      prismaMock.purpose.findMany.mockRejectedValue(new Error('DB Error'));

      const request = createMockNextRequest('http://localhost:3000/api/purposes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch purposes' });
    });
  });

  describe('POST', () => {
    it('正常にPurposeを作成できる', async () => {
      const newPurpose = testData.purpose;
      prismaMock.purpose.create.mockResolvedValue(newPurpose);

      const request = createMockNextRequest('http://localhost:3000/api/purposes', {
        method: 'POST',
        body: {
          title: newPurpose.title,
          description: newPurpose.description,
          questions: newPurpose.questions,
          deadline: null,
          createdBy: newPurpose.createdBy,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(newPurpose);
      expect(prismaMock.purpose.create).toHaveBeenCalledWith({
        data: {
          title: newPurpose.title,
          description: newPurpose.description,
          questions: newPurpose.questions,
          deadline: null,
          createdBy: newPurpose.createdBy,
        },
      });
    });

    it('titleが欠けている場合は400エラーを返す', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/purposes', {
        method: 'POST',
        body: {
          description: 'test',
          questions: [],
          createdBy: 'client-123',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Title, description, and questions are required');
    });

    it('descriptionが欠けている場合は400エラーを返す', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/purposes', {
        method: 'POST',
        body: {
          title: 'test',
          questions: [],
          createdBy: 'client-123',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Title, description, and questions are required');
    });

    it('questionsが欠けている場合は400エラーを返す', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/purposes', {
        method: 'POST',
        body: {
          title: 'test',
          description: 'test',
          createdBy: 'client-123',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Title, description, and questions are required');
    });

    it('createdByが欠けている場合は400エラーを返す', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/purposes', {
        method: 'POST',
        body: {
          title: 'test',
          description: 'test',
          questions: [],
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('createdBy (clientId) is required');
    });

    it('questionsが空配列の場合は400エラーを返す', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/purposes', {
        method: 'POST',
        body: {
          title: 'test',
          description: 'test',
          questions: [],
          createdBy: 'client-123',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Questions must be a non-empty array');
    });

    it('deadlineが文字列の場合はDateに変換される', async () => {
      const deadlineStr = '2025-12-31T23:59:59Z';
      prismaMock.purpose.create.mockResolvedValue(testData.purpose);

      const request = createMockNextRequest('http://localhost:3000/api/purposes', {
        method: 'POST',
        body: {
          title: 'test',
          description: 'test',
          questions: [{ id: 'q1', label: 'test', type: 'text', required: true }],
          deadline: deadlineStr,
          createdBy: 'client-123',
        },
      });

      await POST(request);

      expect(prismaMock.purpose.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          deadline: new Date(deadlineStr),
        }),
      });
    });

    it('DBエラー時に500エラーを返す', async () => {
      prismaMock.purpose.create.mockRejectedValue(new Error('DB Error'));

      const request = createMockNextRequest('http://localhost:3000/api/purposes', {
        method: 'POST',
        body: {
          title: 'test',
          description: 'test',
          questions: [{ id: 'q1', label: 'test', type: 'text', required: true }],
          createdBy: 'client-123',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create purpose' });
    });
  });
});
