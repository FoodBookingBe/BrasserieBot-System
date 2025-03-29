import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Define interfaces for expected API responses
interface ClaudeErrorResponse {
  error?: {
    message?: string;
  };
}

interface ClaudeSuccessResponse {
  content: Array<{
    text?: string;
  }>;
}

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}

  /**
   * Generate business advice using Claude API
   * @param prompt The prompt to send to Claude
   * @returns The generated advice
   */
  async generateBusinessAdvice(prompt: string): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('CLAUDE_API_KEY');

      if (!apiKey) {
        throw new Error('CLAUDE_API_KEY is not defined in environment variables');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        // Type the error response
        const errorData = (await response.json()) as ClaudeErrorResponse;
        const errorMessage = errorData?.error?.message || response.statusText;
        throw new Error(`Claude API error: ${errorMessage}`);
      }

      // Type the success response
      const data = (await response.json()) as ClaudeSuccessResponse;

      // Safely access the content
      const advice = data?.content?.[0]?.text;
      if (typeof advice !== 'string') {
        console.error('Unexpected Claude API response format:', data);
        throw new Error('Unexpected response format from Claude API');
      }
      return advice;
    } catch (error) {
      console.error('Error generating business advice:', error);
      // Ensure error has a message property
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate business advice: ${message}`);
    }
  }
}
