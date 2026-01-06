import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';

@Controller('org')
export class OrganizationsController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async index(@Req() req: Request, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
        headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/login');
    }

    const organizations = await (this.authService.auth.api as any).listOrganizations({
        headers: new Headers(req.headers as any),
    });

    return res.render('organizations/index', { 
        user: session.user,
        organizations: organizations
    });
  }

  @Get('new')
  async new(@Req() req: Request, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
        headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/login');
    }

    return res.render('organizations/new', { 
        user: session.user 
    });
  }

  @Get(':slug/settings')
  async settings(@Param('slug') slug: string, @Req() req: Request, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
        headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/login');
    }

    const organizations = await (this.authService.auth.api as any).listOrganizations({
        headers: new Headers(req.headers as any),
    });

    const organization = organizations.find((org) => org.slug === slug);

    if (!organization) {
      // Allow user to see "not found" or handle gracefully
      // For now, redirect to list
      return res.redirect('/org');
    }

    return res.render('organizations/settings', { 
        user: session.user,
        organization: organization
    });
  }
}
