import { All, Controller, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    const { toNodeHandler } = await import('better-auth/node');
    return toNodeHandler(this.authService.auth)(req, res);
  }
}
