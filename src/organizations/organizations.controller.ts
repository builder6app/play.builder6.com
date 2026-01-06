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
      return res.redirect('/accounts/login');
    }

    const organizations = await (this.authService.auth.api as any).listOrganizations({
        headers: new Headers(req.headers as any),
    });

    return res.render('organizations/index', { 
        user: session.user,
        organizations
    });
  }

  @Get('new')
  async new(@Req() req: Request, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
        headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/accounts/login');
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
      return res.redirect('/accounts/login');
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

  @Get(':slug/members')
  async members(@Param('slug') slug: string, @Req() req: Request, @Res() res: Response) {
    const headers = new Headers(req.headers as any);
    const session = await this.authService.auth.api.getSession({ headers });
    if (!session) {
      return res.redirect('/accounts/login');
    }

    const organizations = await (this.authService.auth.api as any).listOrganizations({ headers });
    const organization = organizations.find((org) => org.slug === slug);

    if (!organization) {
      return res.redirect('/org');
    }
    
    // Set this organization as active just in case, or at least ensure context
    // Fetch members using the internal API client
    let members = [];
    try {
        const result = await (this.authService.auth.api as any).listMembers({
            headers,
            query: {
                organizationId: organization.id
            }
        });
        // result is usually array or { members: [] }
        members = Array.isArray(result) ? result : (result.members || []);
    } catch (e) {
        // console.error(e);
    }
    
    // Try to fetch invitations if endpoint exists
    let invitations = [];
    try {
         // This assumes listInvitations exists
         const invRes = await (this.authService.auth.api as any).listInvitations({
             headers,
             query: { organizationId: organization.id }
         });
         invitations = Array.isArray(invRes) ? invRes : (invRes.invitations || invRes || []);
         invitations = invitations.filter((inv: any) => inv.status !== 'canceled');
    } catch (e) {
        // console.error(e);
    }

    return res.render('organizations/members', { 
        user: session.user,
        organization,
        members,
        invitations
    });
  }
}
