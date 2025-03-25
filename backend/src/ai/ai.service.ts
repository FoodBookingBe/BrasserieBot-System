import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error generating business advice:', error);
      throw new Error(`Failed to generate business advice: ${error.message}`);
    }
  }
}