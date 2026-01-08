import { Controller, Post, Get, Body, Res, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { Response } from 'express';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body() body: { prompt: string; currentCode?: string; model?: string; type?: 'page' | 'object' }, @Res() res: Response) {
    try {
      const result = await this.aiService.generateCode(body.prompt, body.currentCode, body.model, body.type);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Post('stream')
  async generateStream(@Body() body: { prompt: string; currentCode?: string; model?: string; type?: 'page' | 'object' }, @Res() res: Response) {
    try {
      if (body.type === 'object') {
        const result = await this.aiService.generateCode(body.prompt, body.currentCode, body.model, body.type);
        return res.status(HttpStatus.OK).json(result);
      }

      const stream = await this.aiService.generateCodeStream(body.prompt, body.currentCode, body.model, body.type);
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(content);
        }
      }
      res.end();
    } catch (error) {
      if (!res.headersSent) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
      res.end();
    }
  }

  @Get('models')
  async getModels(@Res() res: Response) {
    try {
      const models = await this.aiService.getModels();
      return res.status(HttpStatus.OK).json(models);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}
