/**
 * /api/purposes/generate のテスト
 * - POST: AIによる質問生成（バリデーション、LLMモック）
 */

jest.mock('../../../src/lib/ai');

import { POST } from '@/app/api/purposes/generate/route';
import { generateQuestions } from '@/lib/ai';
import { createMockNextRequest } from '../utils/testHelpers';

const mockGenerateQuestions = generateQuestions as jest.MockedFunction<typeof generateQuestions>;

const mockQuestionsResponse = [
  {
    id: 'q1',
    label: '好きな食べ物は何ですか？',
    type: 'single_choice' as const,
    options: ['寿司', 'ラーメン', 'カレー', 'その他'],
    required: true,
  },
  {
    id: 'q2',
    label: '予算はいくらですか？',
    type: 'single_choice' as const,
    options: ['1000円以下', '1000-2000円', '2000-3000円', '3000円以上'],
    required: true,
  },
];

describe('/api/purposes/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(data.error).toBe('Title is required');
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
    expect(data.error).toBe('Description is required');
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
