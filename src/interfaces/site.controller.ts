import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PageService } from './page.service';
import { ProjectService } from './project.service';

@Controller('app')
export class SiteController {
  constructor(
    private readonly PageService: PageService,
    private readonly projectService: ProjectService,
  ) {}

  private async resolveProject(slugOrId: string) {
    let project = await this.projectService.findBySlug(slugOrId);
    if (!project) {
      try {
        project = await this.projectService.findOne(slugOrId);
      } catch (e) {
        // Ignore
      }
    }
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  @Get(':slug')
  async getHome(@Param('slug') slug: string, @Res() res: Response) {
    const project = await this.resolveProject(slug);

    if (!project.homePage) {
      return res.status(404).send('This project does not have a home page set.');
    }

    const page = await this.PageService.findOne(project.homePage);
    if (!page) {
      return res.status(404).send('Home page not found.');
    }

    const pages = await this.PageService.findAllByProject(project._id!);
    const navPages = pages.filter(p => p.addToNavigation);
    const editUrl = `/interfaces/${project._id}/${page._id}`;

    return res.render('app', { page, project, navPages, editUrl });
  }

  @Get(':slug/p/:pageId')
  async getPageById(
    @Param('slug') slug: string,
    @Param('pageId') pageId: string,
    @Res() res: Response,
  ) {
    const project = await this.resolveProject(slug);

    const page = await this.PageService.findOne(pageId);
    if (!page || page.projectId !== project._id) {
      throw new NotFoundException('Page not found');
    }

    const pages = await this.PageService.findAllByProject(project._id!);
    const navPages = pages.filter(p => p.addToNavigation);
    const editUrl = `/interfaces/${project._id}/${page._id}`;

    return res.render('app', { page, project, navPages, editUrl });
  }

  @Get(':slug/:path')
  async getPage(
    @Param('slug') slug: string,
    @Param('path') path: string,
    @Res() res: Response,
  ) {
    const project = await this.resolveProject(slug);

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
    const editUrl = `/interfaces/${project._id}/${page._id}`;

    return res.render('app', { page, project, navPages, editUrl });
  }
}
