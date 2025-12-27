import { Question, AISummary } from '@/types/survey';

// AI関数のモック
export const mockGenerateQuestions = jest.fn<Promise<Question[]>, any[]>();
export const mockGenerateSummary = jest.fn<Promise<AISummary>, any[]>();

// AIモジュールのモック
jest.mock('@/lib/ai', () => ({
  __esModule: true,
  generateQuestions: mockGenerateQuestions,
  generateSummary: mockGenerateSummary,
}));

// デフォルトの質問生成レスポンス
export const mockQuestionsResponse: Question[] = [
  {
    id: 'q1',
    label: '好きな食べ物は何ですか？',
    type: 'single_choice',
    options: ['寿司', 'ラーメン', 'カレー', 'その他'],
    required: true,
  },
  {
    id: 'q2',
    label: '予算はいくらですか？',
    type: 'single_choice',
    options: ['1000円以下', '1000-2000円', '2000-3000円', '3000円以上'],
    required: true,
  },
];

// デフォルトのAI要約レスポンス
export const mockSummaryResponse: AISummary = {
  insights: '回答者の多くは寿司を好み、予算は2000-3000円を希望しています。',
  recommendations: '新鮮なネタを使用した寿司店がおすすめです。価格帯は2000-3000円が適切です。',
};
