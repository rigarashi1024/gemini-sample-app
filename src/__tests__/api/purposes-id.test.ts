/**
 * /api/purposes/[id] のテスト
 * - GET: Purpose詳細取得（responses含む）
 * - PUT: Purpose更新
 * - DELETE: Purpose削除
 */

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

jest.mock('../../../src/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import { GET, PUT, DELETE } from '@/app/api/purposes/[id]/route';
import { prisma } from '@/lib/prisma';
import { createMockNextRequest, testData } from '../utils/testHelpers';

const prismaMock = prisma as DeepMockProxy<PrismaClient>;

describe('/api/purposes/[id]', () => {
  describe('GET', () => {
    it('正常にPurpose詳細を取得できる', async () => {
      const purposeWithResponses = {
        ...testData.purpose,
        responses: [testData.response],
      };
      prismaMock.purpose.findUnique.mockResolvedValue(purposeWithResponses as any);

      const request = createMockNextRequest('http://localhost:3000/api/purposes/purpose-123');
      const response = await GET(request, { params: { id: 'purpose-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(purposeWithResponses);
      expect(prismaMock.purpose.findUnique).toHaveBeenCalledWith({
        where: { id: 'purpose-123' },
        include: { responses: true },
      });
    });

    it('存在しないIDの場合は404エラーを返す', async () => {
      prismaMock.purpose.findUnique.mockResolvedValue(null);

      const request = createMockNextRequest('http://localhost:3000/api/purposes/invalid-id');
      const response = await GET(request, { params: { id: 'invalid-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Purpose not found');
    });

    it('DBエラー時に500エラーを返す', async () => {
      prismaMock.purpose.findUnique.mockRejectedValue(new Error('DB Error'));

      const request = createMockNextRequest('http://localhost:3000/api/purposes/purpose-123');
      const response = await GET(request, { params: { id: 'purpose-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch purpose' });
    });
  });

  describe('PUT', () => {
    it('正常にPurposeを更新できる', async () => {
      const updatedPurpose = {
        ...testData.purpose,
        title: '更新されたタイトル',
        description: '更新された説明',
      };
      prismaMock.purpose.update.mockResolvedValue(updatedPurpose as any);

      const request = createMockNextRequest('http://localhost:3000/api/purposes/purpose-123', {
        method: 'PUT',
        body: {
          title: '更新されたタイトル',
          description: '更新された説明',
          questions: testData.purpose.questions,
          deadline: null,
        },
      });

      const response = await PUT(request, { params: { id: 'purpose-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedPurpose);
    });

    it('DBエラー時に500エラーを返す', async () => {
      prismaMock.purpose.update.mockRejectedValue(new Error('DB Error'));

      const request = createMockNextRequest('http://localhost:3000/api/purposes/purpose-123', {
        method: 'PUT',
        body: {
          title: 'test',
          description: 'test',
          questions: [],
        },
      });

      const response = await PUT(request, { params: { id: 'purpose-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update purpose' });
    });
  });

  describe('DELETE', () => {
    it('正常にPurposeを削除できる', async () => {
      prismaMock.purpose.delete.mockResolvedValue(testData.purpose as any);

      const request = createMockNextRequest('http://localhost:3000/api/purposes/purpose-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'purpose-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(prismaMock.purpose.delete).toHaveBeenCalledWith({
        where: { id: 'purpose-123' },
      });
    });

    it('DBエラー時に500エラーを返す', async () => {
      prismaMock.purpose.delete.mockRejectedValue(new Error('DB Error'));

      const request = createMockNextRequest('http://localhost:3000/api/purposes/purpose-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'purpose-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete purpose' });
    });
  });
});
