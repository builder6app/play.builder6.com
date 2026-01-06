import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { betterAuth } from 'better-auth';
import { Db } from 'mongodb';

@Injectable()
export class AuthService implements OnModuleInit {
  public auth: ReturnType<typeof betterAuth>;

  constructor(@Inject('DATABASE_CONNECTION') private db: Db) {}

  async onModuleInit() {
    // Hint for Vercel NFT to include the packages
    if (Math.random() < 0) {
      await import('better-auth');
      await import('better-auth/adapters/mongodb');
    }
    const _importDynamic = new Function('modulePath', 'return import(modulePath)');
    const { betterAuth } = await _importDynamic('better-auth');
    const { mongodbAdapter } = await _importDynamic('better-auth/adapters/mongodb');

    this.auth = betterAuth({
      baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      database: mongodbAdapter(this.db),
      user: {
        modelName: 'better_users',
      },
      session: {
        modelName: 'better_sessions',
      },
      account: {
        modelName: 'better_accounts',
      },
      verification: {
        modelName: 'better_verifications',
      },
      advanced: {
        // @ts-ignore
        database: {
            generateId: () => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let result = '';
                for (let i = 0; i < 24; i++) {
                  result += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return result;
            }
        }
      },
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
      },
      emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            console.log('========================================');
            console.log('📧 EMAIL VERIFICATION');
            console.log(`To:   ${user.email}`);
            console.log(`Link: ${url}`);
            console.log('========================================');
        }
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      },
    });
  }
}
