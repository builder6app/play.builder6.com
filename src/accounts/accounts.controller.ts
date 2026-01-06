import { Controller, Get, Param, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  getLogin(@Res() res: Response) {
      return res.render('accounts/login');
  }

  @Get('register')
  getRegister(@Res() res: Response) {
      return res.render('accounts/register');
  }

  @Get('password/reset')
  getForgotPassword(@Res() res: Response) {
      return res.render('accounts/forgot-password');
  }

  @Get('password/new')
  getResetPassword(@Res() res: Response) {
      return res.render('accounts/reset-password');
  }

  @Get('profile')
  async getProfile(@Req() req: Request, @Res() res: Response) {
      const session = await this.authService.auth.api.getSession({
          headers: new Headers(req.headers as any),
      });

      if (!session) {
          return res.redirect('/accounts/login');
      }

      return res.render('accounts/profile', {
          user: session.user,
          full_session: session
      });
  }

  @Get('password/change')
  async getChangePassword(@Req() req: Request, @Res() res: Response) {
       const session = await this.authService.auth.api.getSession({
          headers: new Headers(req.headers as any),
      });

      if (!session) {
          return res.redirect('/accounts/login');
      }
      
      return res.render('accounts/change-password', {
         user: session.user
      });
  }

  @Get('invite/accept')
  async getAcceptInvite(@Req() req: Request, @Res() res: Response) {
      // better-auth might send them to /accept-invitation/:id by default if configured?
      // actually, usually it constructs a URL based on baseURL.
      // If we want to capture it, we might need to handle the token.
      
      // Let's assume the link is something like /accept-invitation/token
      // We'll create a generic accept page that can parse the URL or handle the flow
      return res.render('accounts/accept-invite');
  }

  @Get('accept-invitation/:id')
  async handleAcceptInvitation(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {    
      const session = await this.authService.auth.api.getSession({
          headers: new Headers(req.headers as any),
      });

     return res.render('accounts/accept-invite', { 
         invitationId: id,
         user: session?.user
     });
  }
}
