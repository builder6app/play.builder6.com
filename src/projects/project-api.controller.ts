import { Body, Controller, Delete, Param, Post, Put, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProjectService } from './project.service';
import { AuthService } from '../auth/auth.service';
import { PageService } from '../pages/page.service';

@Controller('api/projects')
export class ProjectApiController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly authService: AuthService,
    private readonly pageService: PageService
  ) {}

    @Post()
  async create(@Req() req: Request, @Body('name') name: string, @Body('description') description: string, @Body('slug') slug: string, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        const project = await this.projectService.create(session.user.id, name, description, slug);
        
        // Create default Home Page (Using correct reference if moved to PagesModule, for now keep logic here or delegate)
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
        const homePage = await this.pageService.save({
          projectId: project._id!,
          name: 'Home',
          code: defaultCode,
          slug: 'home'
        }, session.user.id);

        if (homePage._id) {
          await this.projectService.update(project._id!, session.user.id!, { homePage: homePage._id });
        }
        
        return res.status(201).json(project);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() body: any, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.status(401).send('Unauthorized');
    }
    
    try {
      await this.projectService.update(id, session.user.id, body);
      return res.status(200).send('Updated');
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
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
}