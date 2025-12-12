/**
 * LLMプロバイダーの共通インターフェース
 */

export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LLMResponse = {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
};

export interface LLMProvider {
  /**
   * LLMにメッセージを送信し、レスポンスを取得
   */
  generateText(prompt: string, options?: LLMGenerateOptions): Promise<LLMResponse>;

  /**
   * プロバイダー名を取得
   */
  getProviderName(): string;
}

export type LLMGenerateOptions = {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

export type LLMProviderType = 'gemini' | 'anthropic';
