import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMResponse, LLMGenerateOptions } from './types';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generateText(
    prompt: string,
    options?: LLMGenerateOptions
  ): Promise<LLMResponse> {
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        messages: [
          {
            role: 'user',
            content: options?.systemPrompt
              ? `${options.systemPrompt}\n\n${prompt}`
              : prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
      }

      const usage = {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      };

      return {
        content: content.text,
        usage,
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error(`Failed to generate text with Anthropic: ${error}`);
    }
  }

  getProviderName(): string {
    return 'anthropic';
  }
}
