import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMResponse, LLMGenerateOptions } from './types';

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash-lite') {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generateText(
    prompt: string,
    options?: LLMGenerateOptions
  ): Promise<LLMResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 4096,
        },
      });

      // システムプロンプトがある場合は結合
      const fullPrompt = options?.systemPrompt
        ? `${options.systemPrompt}\n\n${prompt}`
        : prompt;

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      // 使用量情報を取得（利用可能な場合）
      const usage = response.usageMetadata
        ? {
            inputTokens: response.usageMetadata.promptTokenCount || 0,
            outputTokens: response.usageMetadata.candidatesTokenCount || 0,
          }
        : undefined;

      return {
        content: text,
        usage,
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate text with Gemini: ${error}`);
    }
  }

  getProviderName(): string {
    return 'gemini';
  }
}
