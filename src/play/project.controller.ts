import { Body, Controller, Get, Param, Post, Put, Delete, Req, Res, Render, Redirect } from '@nestjs/common';
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
    const project = await this.projectService.create(session.user.id, name, description);
    
    // Create default Home Page
    const defaultCode = `<div class="min-h-screen bg-[#000000] flex items-center justify-center font-sans antialiased">
  <div class="w-80 bg-[#1c1c1e] rounded-[2rem] p-6 shadow-2xl border border-white/10 relative overflow-hidden">
    <!-- Background Blur Blob -->
    <div class="absolute top-[-20%] right-[-20%] w-40 h-40 bg-blue-500/30 rounded-full blur-[50px]"></div>
    
    <div class="relative z-10 flex flex-col items-center text-center">
      <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 mb-4 shadow-lg flex items-center justify-center text-3xl">
        🎨
      </div>
      
      <h2 class="text-white text-xl font-semibold mb-1">Design System</h2>
      <p class="text-gray-400 text-sm mb-6">Consistent, reusable components for your next project.</p>
      
      <button class="w-full py-3 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-blue-900/20">
        Explore Components
      </button>
      
      <div class="mt-6 flex gap-4">
        <div class="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
          <span class="text-lg">❤️</span>
        </div>
        <div class="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
          <span class="text-lg">📤</span>
        </div>
      </div>
    </div>
  </div>
</div>`;

    const page = await this.playService.save({
      code: defaultCode,
      projectId: project._id,
      name: 'Home',
      path: 'home',
      addToNavigation: true
    }, session.user.id);

    // Set as home page
    if (project._id && page._id) {
        await this.projectService.update(project._id, session.user.id, { homePage: page._id });
        return res.redirect(`/projects/${project._id}/${page._id}`);
    }
    
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
    
    // Find pages belonging to this project
    const pages = await this.playService.findAllByProject(id);
    
    if (pages.length > 0) {
      // Redirect to the first page (or home page if we can identify it, but first is fine for now)
      // Ideally we should check project.homePage, but finding the first one is a good fallback
      const project = await this.projectService.findOne(id);
      const homePageId = project.homePage || pages[0]._id;
      return res.redirect(`/projects/${id}/${homePageId}`);
    }

    // Fallback if no pages exist (shouldn't happen with new create logic, but for old projects)
    const project = await this.projectService.findOne(id);
    return res.render('projects/show', { project, pages, user: session.user });
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() body: any, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.status(401).send('Unauthorized');
    }
    await this.projectService.update(id, session.user.id, body);
    return res.status(200).send('Updated');
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.status(401).send('Unauthorized');
    }
    await this.projectService.delete(id, session.user.id);
    return res.status(200).send('Deleted');
  }

  @Get(':id/settings')
  async settings(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {
     // ... implementation if needed, but modal is in show.liquid
     return res.redirect(`/projects/${id}`);
  }

  @Get(':projectId/:pageId')
  async editPage(@Req() req: Request, @Param('projectId') projectId: string, @Param('pageId') pageId: string, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    const page = await this.playService.findOne(pageId);
    if (!page) {
      return res.redirect(`/projects/${projectId}`);
    }

    const project = await this.projectService.findOne(projectId);
    const pages = await this.playService.findAllByProject(projectId);

    return res.render('editor', { page, projectId, project, pages, user: session?.user });
  }
}
