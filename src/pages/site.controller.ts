import { Controller, Get, Post, Param, Res, Body, NotFoundException, All } from '@nestjs/common';
import { Response } from 'express';
import { PageService } from './page.service';
import { ProjectService } from '../projects/project.service';

@Controller('site')
export class SiteController {
  constructor(
    private readonly PageService: PageService,
    private readonly projectService: ProjectService,
  ) {}

  private async resolveProject(projectSlug: string) {
    let project = await this.projectService.findBySlug(projectSlug);
    if (!project) {
      try {
        project = await this.projectService.findOne(projectSlug);
      } catch (e) {
        // Ignore
      }
    }
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  @All(':projectSlug/:pageId/preview')
  async getPreview(
    @Param('projectSlug') projectSlug: string,
    @Param('pageId') pageId: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    const page = await this.PageService.findOne(pageId);
    if (!page) {
      return res.status(404).send('Page not found');
    }

    // Support previewing unsaved code via POST
    if (body && body.code) {
      page.code = body.code;
    }

    // Optional: Verify project context if needed
    // const project = await this.projectService.findOne(projectId);

    return res.render('pages/preview', { page });
  }

  @Get(':projectSlug')
  async getHome(@Param('projectSlug') projectSlug: string, @Res() res: Response) {
    const project = await this.resolveProject(projectSlug);

    if (!project.homePage) {
      return res.status(404).send('This project does not have a home page set.');
    }

    const page = await this.PageService.findOne(project.homePage);
    if (!page) {
      return res.status(404).send('Home page not found.');
    }

    const pages = await this.PageService.findAllByProject(project._id!);
    const navPages = pages.filter(p => p.addToNavigation);
    const projectSlugOrId = project.slug || project._id;
    const editUrl = `/app/${projectSlugOrId}/${page._id}`;

    return res.render('pages/site', { page, project, navPages, editUrl });
  }

  @Get(':projectSlug/p/:pageId')
  async getPageById(
    @Param('projectSlug') projectSlug: string,
    @Param('pageId') pageId: string,
    @Res() res: Response,
  ) {
    const project = await this.resolveProject(projectSlug);

    const page = await this.PageService.findOne(pageId);
    if (!page || page.projectId !== project._id) {
      throw new NotFoundException('Page not found');
    }

    const pages = await this.PageService.findAllByProject(project._id!);
    const navPages = pages.filter(p => p.addToNavigation);
    const projectSlugOrId = project.slug || project._id;
    const editUrl = `/app/${projectSlugOrId}/${page._id}`;

    return res.render('pages/site', { page, project, navPages, editUrl });
  }

  @Get(':projectSlug/:path')
  async getPage(
    @Param('projectSlug') projectSlug: string,
    @Param('path') path: string,
    @Res() res: Response,
  ) {
    const project = await this.resolveProject(projectSlug);

    // 1. Try to find by path
    let page = await this.PageService.findByPath(project._id!, path);

    // 2. If not found, try to find by ID
    if (!page) {
      try {
        const pageById = await this.PageService.findOne(path);
        if (pageById && pageById.projectId === project._id) {
          page = pageById;
        }
      } catch (e) {
        // Ignore if ID not found or invalid
      }
    }

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const pages = await this.PageService.findAllByProject(project._id!);
    const navPages = pages.filter(p => p.addToNavigation);
    const projectSlugOrId = project.slug || project._id;
    const editUrl = `/app/${projectSlugOrId}/${page._id}`;

    return res.render('pages/site', { page, project, navPages, editUrl });
  }
}
