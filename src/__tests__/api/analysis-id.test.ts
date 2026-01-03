/**
 * /api/analysis/[id] のテスト
 * - GET: アンケート結果の分析（集計 + AI要約）
 */

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

jest.mock('../../../src/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

jest.mock('../../../src/lib/ai');

import { GET } from '@/app/api/analysis/[id]/route';
import { prisma } from '@/lib/prisma';
import { generateSummary } from '@/lib/ai';
import { createMockNextRequest, testData } from '../utils/testHelpers';

const prismaMock = prisma as DeepMockProxy<PrismaClient>;
const mockGenerateSummary = generateSummary as jest.MockedFunction<typeof generateSummary>;

describe('/api/analysis/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('正常にアンケート結果を分析できる', async () => {
      const purposeWithResponses = {
        ...testData.purpose,
        responses: [
          {
            id: 'response-1',
            purposeId: 'purpose-123',
            clientId: 'client-1',
            respondentName: '回答者1',
            answers: [{ questionId: 'q1', value: '選択肢1' }],
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: 'response-2',
            purposeId: 'purpose-123',
            clientId: 'client-2',
            respondentName: '回答者2',
            answers: [{ questionId: 'q1', value: '選択肢1' }],
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        ],
      };
      prismaMock.purpose.findUnique.mockResolvedValue(purposeWithResponses);
      mockGenerateSummary.mockResolvedValue('AI要約: テスト結果の要約です');

      const request = createMockNextRequest('http://localhost:3000/api/analysis/purpose-123');
      const response = await GET(request, { params: { id: 'purpose-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('purpose');
      expect(data).toHaveProperty('aggregation');
      expect(data).toHaveProperty('aiSummary');
      expect(data).toHaveProperty('totalResponses');
      expect(data.totalResponses).toBe(2);
      expect(data.purpose.id).toBe('purpose-123');
    });

    it('回答が0件の場合でも正常に動作する', async () => {
      const purposeWithoutResponses = {
        ...testData.purpose,
        responses: [],
      };
      prismaMock.purpose.findUnique.mockResolvedValue(purposeWithoutResponses);

      const request = createMockNextRequest('http://localhost:3000/api/analysis/purpose-123');
      const response = await GET(request, { params: { id: 'purpose-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalResponses).toBe(0);
      expect(data.aiSummary).toBeNull();
      expect(mockGenerateSummary).not.toHaveBeenCalled();
    });

    it('存在しないIDの場合は404エラーを返す', async () => {
      prismaMock.purpose.findUnique.mockResolvedValue(null);

      const request = createMockNextRequest('http://localhost:3000/api/analysis/invalid-id');
      const response = await GET(request, { params: { id: 'invalid-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Purpose not found');
    });

    it('DBエラー時に500エラーを返す', async () => {
      prismaMock.purpose.findUnique.mockRejectedValue(new Error('DB Error'));

      const request = createMockNextRequest('http://localhost:3000/api/analysis/purpose-123');
      const response = await GET(request, { params: { id: 'purpose-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to analyze purpose' });
    });
  });
});
