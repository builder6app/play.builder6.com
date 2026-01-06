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
      await import('better-auth/plugins');
    }
    const _importDynamic = new Function('modulePath', 'return import(modulePath)');
    const { betterAuth } = await _importDynamic('better-auth');
    const { mongodbAdapter } = await _importDynamic('better-auth/adapters/mongodb');
    const { organization } = await _importDynamic('better-auth/plugins');

    this.auth = betterAuth({
      baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      plugins: [
        organization({
            schema: {
                organization: {
                    modelName: 'spaces',
                },
                member: {
                    modelName: 'space_users',
                }
            }
        })
      ],
      database: mongodbAdapter(this.db),
      databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    const generateId = () => {
                        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        let result = '';
                        for (let i = 0; i < 24; i++) {
                          result += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        return result;
                    };

                    const orgId = generateId();
                    const orgName = (user.name || 'Personal') + "'s Workspace";
                    const slug = (user.name || 'personal').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + generateId().substring(0, 5).toLowerCase();

                    const org = {
                        _id: orgId,
                        name: orgName,
                        slug: slug,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };

                    const member = {
                        _id: generateId(),
                        organizationId: orgId,
                        userId: user.id,
                        role: "owner",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };

                    await this.db.collection('spaces').insertOne(org as any);
                    await this.db.collection('space_users').insertOne(member as any);
                }
            }
        },
        session: {
            create: {
                before: async (session) => {
                    if (!(session as any).activeOrganizationId) {
                        const member = await this.db.collection('space_users').findOne({ userId: session.userId });
                        if (member) {
                            (session as any).activeOrganizationId = member.organizationId;
                        }
                    }
                    return session;
                },
            },
        },
      },
      user: {
        modelName: 'users',
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
