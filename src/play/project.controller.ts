import { Body, Controller, Get, Param, Post, Req, Res, Render, Redirect } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProjectService } from './project.service';
import { AuthService } from '../auth/auth.service';
import { PlayService } from './play.service';

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly authService: AuthService,
    private readonly playService: PlayService
  ) {}

  @Get()
  async index(@Req() req: Request, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/login');
    }
    const projects = await this.projectService.findAll(session.user.id);
    return res.render('projects/index', { projects, user: session.user });
  }

  @Post()
  async create(@Req() req: Request, @Body('name') name: string, @Body('description') description: string, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/login');
    }
    await this.projectService.create(session.user.id, name, description);
    return res.redirect('/projects');
  }

  @Get(':id')
  async show(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/login');
    }
    const project = await this.projectService.findOne(id);
    // Find snippets belonging to this project
    const snippets = await this.playService.findAllByProject(id);
    return res.render('projects/show', { project, snippets, user: session.user });
  }
}
