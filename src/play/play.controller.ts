import { Body, Controller, Get, Param, Post, Req, Res, Delete } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import { PlayService } from './play.service';
import { CreatePageDto } from './dto/create-page.dto';
import { Page } from './schemas/page.schema';
import { PageVersion } from './schemas/page-version.schema';
import { AuthService } from '../auth/auth.service';

@Controller()
export class PlayController {
  constructor(
    private readonly playService: PlayService,
    private readonly authService: AuthService
  ) {}

  @Post('api/pages')
  async create(@Body() createPageDto: CreatePageDto, @Req() req: Request): Promise<Page> {
    const session = await this.authService.auth.api.getSession({
        headers: new Headers(req.headers as any),
    });
    return this.playService.save(createPageDto, session?.user?.id);
  }

  @Get('api/pages')
  async findAll(@Req() req: Request): Promise<Page[]> {
    const session = await this.authService.auth.api.getSession({
        headers: new Headers(req.headers as any),
    });
    return this.playService.findAll(session?.user?.id);
  }

  @Get('api/pages/:id')
  async findOne(@Param('id') id: string): Promise<Page> {
    return this.playService.findOne(id);
  }

  @Get('api/pages/:id/versions')
  async getVersions(@Param('id') id: string): Promise<PageVersion[]> {
    return this.playService.getVersions(id);
  }


}


