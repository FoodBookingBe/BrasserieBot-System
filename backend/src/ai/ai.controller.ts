import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('business-advice')
  async getBusinessAdvice(@Body() body: { prompt: string }) {
    return {
      advice: await this.aiService.generateBusinessAdvice(body.prompt),
    };
  }
}
