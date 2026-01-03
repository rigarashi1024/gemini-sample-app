/**
 * /api/responses のテスト
 * - GET: 既存回答取得（clientId+purposeIdでの検索）
 * - POST: 回答作成/更新（Upsert動作、重複抑止）
 */

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

jest.mock('../../../src/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import { GET, POST } from '@/app/api/responses/route';
import { prisma } from '@/lib/prisma';
import { createMockNextRequest, testData } from '../utils/testHelpers';

const prismaMock = prisma as DeepMockProxy<PrismaClient>;

describe('/api/responses', () => {
  describe('GET', () => {
    it('既存の回答を取得できる', async () => {
      prismaMock.response.findUnique.mockResolvedValue(testData.response);

      const request = createMockNextRequest(
        'http://localhost:3000/api/responses?purposeId=purpose-123&clientId=client-123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(testData.response);
    });

    it('purposeIdが欠けている場合は400エラーを返す', async () => {
      const request = createMockNextRequest(
        'http://localhost:3000/api/responses?clientId=client-123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('PurposeId and clientId are required');
    });

    it('clientIdが欠けている場合は400エラーを返す', async () => {
      const request = createMockNextRequest(
        'http://localhost:3000/api/responses?purposeId=purpose-123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('PurposeId and clientId are required');
    });

    it('回答が存在しない場合は404エラーを返す', async () => {
      prismaMock.response.findUnique.mockResolvedValue(null);

      const request = createMockNextRequest(
        'http://localhost:3000/api/responses?purposeId=purpose-123&clientId=client-123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Response not found');
    });
  });

  describe('POST', () => {
    it('新規回答を作成できる', async () => {
      prismaMock.response.findUnique.mockResolvedValue(null);
      prismaMock.response.create.mockResolvedValue(testData.response);

      const request = createMockNextRequest('http://localhost:3000/api/responses', {
        method: 'POST',
        body: {
          purposeId: 'purpose-123',
          clientId: 'client-123',
          respondentName: 'テスト太郎',
          answers: [{ questionId: 'q1', value: '選択肢1' }],
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(testData.response);
      expect(prismaMock.response.create).toHaveBeenCalled();
    });

    it('既存回答がある場合は更新する（Upsert）', async () => {
      const existingResponse = { ...testData.response, id: 'existing-123' };
      prismaMock.response.findUnique.mockResolvedValue(existingResponse);
      prismaMock.response.update.mockResolvedValue(existingResponse);

      const request = createMockNextRequest('http://localhost:3000/api/responses', {
        method: 'POST',
        body: {
          purposeId: 'purpose-123',
          clientId: 'client-123',
          respondentName: 'テスト太郎（更新）',
          answers: [{ questionId: 'q1', value: '選択肢2' }],
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(prismaMock.response.update).toHaveBeenCalledWith({
        where: { id: 'existing-123' },
        data: {
          respondentName: 'テスト太郎（更新）',
          answers: [{ questionId: 'q1', value: '選択肢2' }],
        },
      });
    });

    it('purposeIdが欠けている場合は400エラーを返す', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/responses', {
        method: 'POST',
        body: {
          answers: [],
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('PurposeId and answers are required');
    });

    it('answersが欠けている場合は400エラーを返す', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/responses', {
        method: 'POST',
        body: {
          purposeId: 'purpose-123',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('PurposeId and answers are required');
    });
  });
});
