import { NextRequest } from 'next/server';

// NextRequest のモックを作成するヘルパー
export function createMockNextRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = 'GET', body, headers = {} } = options;

  const request = new NextRequest(url, {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  return request;
}

// テスト用のデータファクトリー
export const testData = {
  purpose: {
    id: 'purpose-123',
    title: 'テストアンケート',
    description: 'これはテスト用のアンケートです',
    questions: [
      {
        id: 'q1',
        label: 'テスト質問1',
        type: 'single_choice' as const,
        options: ['選択肢1', '選択肢2', '選択肢3'],
        required: true,
      },
    ],
    shareToken: 'test-token-123',
    deadline: null,
    createdBy: 'client-123',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },

  response: {
    id: 'response-123',
    purposeId: 'purpose-123',
    clientId: 'client-123',
    respondentName: 'テスト太郎',
    answers: [
      {
        questionId: 'q1',
        value: '選択肢1',
      },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
};
