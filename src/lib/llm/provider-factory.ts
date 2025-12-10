import { LLMProvider, LLMProviderType } from './types';
import { GeminiProvider } from './gemini-provider';
import { AnthropicProvider } from './anthropic-provider';

/**
 * 環境変数から適切なLLMプロバイダーを作成
 */
export function createLLMProvider(): LLMProvider {
  const providerType = (process.env.LLM_PROVIDER || 'gemini') as LLMProviderType;

  switch (providerType) {
    case 'gemini': {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error(
          'GEMINI_API_KEY is not set in environment variables'
        );
      }
      return new GeminiProvider(apiKey);
    }

    case 'anthropic': {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error(
          'ANTHROPIC_API_KEY is not set in environment variables'
        );
      }
      return new AnthropicProvider(apiKey);
    }

    default:
      throw new Error(
        `Unknown LLM provider: ${providerType}. Supported providers: gemini, anthropic`
      );
  }
}

/**
 * 特定のプロバイダーを作成
 */
export function createSpecificProvider(
  providerType: LLMProviderType,
  apiKey: string
): LLMProvider {
  switch (providerType) {
    case 'gemini':
      return new GeminiProvider(apiKey);
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    default:
      throw new Error(`Unknown LLM provider: ${providerType}`);
  }
}
