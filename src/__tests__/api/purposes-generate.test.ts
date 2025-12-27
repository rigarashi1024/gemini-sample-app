/**
 * /api/purposes/generate のテスト
 * - POST: AIによる質問生成（バリデーション、LLMモック）
 */

import { POST } from '@/app/api/purposes/generate/route';
import { mockGenerateQuestions, mockQuestionsResponse } from '../utils/mockAI';
import { createMockNextRequest } from '../utils/testHelpers';

describe('/api/purposes/generate', () => {
  beforeEach(() => {
    mockGenerateQuestions.mockReset();
  });

  it('正常に質問を生成できる', async () => {
    mockGenerateQuestions.mockResolvedValue(mockQuestionsResponse);

    const request = createMockNextRequest('http://localhost:3000/api/purposes/generate', {
      method: 'POST',
      body: {
        title: 'ランチの店選び',
        description: '美味しいランチの店を探しています',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.questions).toEqual(mockQuestionsResponse);
    expect(mockGenerateQuestions).toHaveBeenCalledWith({
      title: 'ランチの店選び',
      description: '美味しいランチの店を探しています',
    });
  });

  it('titleが欠けている場合は400エラーを返す', async () => {
    const request = createMockNextRequest('http://localhost:3000/api/purposes/generate', {
      method: 'POST',
      body: {
        description: 'test',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Title and description are required');
  });

  it('descriptionが欠けている場合は400エラーを返す', async () => {
    const request = createMockNextRequest('http://localhost:3000/api/purposes/generate', {
      method: 'POST',
      body: {
        title: 'test',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Title and description are required');
  });

  it('AI生成エラー時に500エラーを返す', async () => {
    mockGenerateQuestions.mockRejectedValue(new Error('AI Error'));

    const request = createMockNextRequest('http://localhost:3000/api/purposes/generate', {
      method: 'POST',
      body: {
        title: 'test',
        description: 'test',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to generate questions' });
  });
});
