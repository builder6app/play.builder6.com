import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import { PlayService } from './play.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { Snippet } from './schemas/snippet.schema';
import { SnippetVersion } from './schemas/snippet-version.schema';
import { AuthService } from '../auth/auth.service';

@Controller()
export class PlayController {
  constructor(
    private readonly playService: PlayService,
    private readonly authService: AuthService
  ) {}

  @Post('api/play/snippets')
  async create(@Body() createSnippetDto: CreateSnippetDto, @Req() req: Request): Promise<Snippet> {
    const session = await this.authService.auth.api.getSession({
        headers: new Headers(req.headers as any),
    });
    return this.playService.save(createSnippetDto, session?.user?.id);
  }

  @Get('api/play/snippets')
  async findAll(): Promise<Snippet[]> {
    return this.playService.findAll();
  }

  @Get('api/play/snippets/:id')
  async findOne(@Param('id') id: string): Promise<Snippet> {
    return this.playService.findOne(id);
  }

  @Get('api/play/snippets/:id/versions')
  async getVersions(@Param('id') id: string): Promise<SnippetVersion[]> {
    return this.playService.getVersions(id);
  }

  @Get('view/:id')
  async viewSnippet(@Param('id') id: string, @Res() res: Response) {
    const snippet = await this.playService.findOne(id);
    const html = this.playService.buildHtml(snippet.code);
    res.set('Content-Type', 'text/html');
    res.send(html);
  }

  @Get(':id')
  async getSnippetPage(@Param('id') id: string, @Res() res: Response) {
    return res.render('index');
  }
}
