import { Body, Controller, Get, Param, Post, Put, Delete, Req, Res, Render, Redirect } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProjectService } from './project.service';
import { AuthService } from '../auth/auth.service';
import { PageService } from '../pages/page.service';
import { ObjectsService } from '../objects/objects.service'; // Import ObjectsService

@Controller('app')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly authService: AuthService,
    private readonly PageService: PageService,
    private readonly objectsService: ObjectsService // Inject ObjectsService
  ) {}

  @Get()
  async index(@Req() req: Request, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/login');
    }

    // Require active organization
    const activeOrgId = (session.session as any).activeOrganizationId;
    if (!activeOrgId) {
        // If user has orgs, force them to select one/set active?
        // But auth.service creates personal org automatically, so usually they have one.
        // If session doesn't have it, maybe it wasn't set.
        // Redirect to org selection or just show empty?
        // Let's list projects for active Org + User owners
    }

    const projects = await this.projectService.findAll(session.user.id, activeOrgId);
    return res.render('projects/index', { projects, user: session.user, activeOrgId });
  }

  @Get('new')
  async new(@Req() req: Request, @Res() res: Response) {
      const session = await this.authService.auth.api.getSession({
        headers: new Headers(req.headers as any),
      });
      if (!session) {
        return res.redirect('/login');
      }
      return res.render('projects/new', { user: session.user });
  }

  @Get(':projectSlug')
  async show(@Req() req: Request, @Param('projectSlug') projectSlug: string, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/login');
    }
    
    const project = await this.projectService.resolve(projectSlug);
    if (!project) {
       // Should render a 404 page or redirect
       return res.redirect('/app');
    }

    // Find pages belonging to this project
    const pages = await this.PageService.findAllByProject(project._id!);
    // Find objects belonging to this project
    const objects = await this.objectsService.findAll(session.user.id, project._id!);
    
    return res.render('projects/show', { project, pages, objects, user: session.user });
  }

  @Get(':projectSlug/settings')
  async settings(@Req() req: Request, @Param('projectSlug') projectSlug: string, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/login');
    }

    const project = await this.projectService.resolve(projectSlug);
    if (!project) {
        return res.redirect('/app');
    }

    // Need pages for the homepage selector
    const pages = await this.PageService.findAllByProject(project._id!);

    return res.render('projects/settings', { project, pages, user: session.user });
  }

  @Get(':projectSlug/:pageId')
  async editPage(@Req() req: Request, @Param('projectSlug') projectSlug: string, @Param('pageId') pageId: string, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    const project = await this.projectService.resolve(projectSlug);
    if (!project) {
       return res.redirect('/app');
    }

    // TODO: Resolve page by slug as well if needed, for now stick to ID for page
    const page = await this.PageService.findOne(pageId);
    if (!page) {
      return res.redirect(`/app/${project.slug || project._id}`);
    }

    const pages = await this.PageService.findAllByProject(project._id!);

    return res.render('pages/editor', { page, projectId: project._id, project, pages, user: session?.user });
  }
}
