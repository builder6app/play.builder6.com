import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { ProjectController } from './project.controller';
import { ProjectApiController } from './project-api.controller';
import { SiteController } from './site.controller';
import { ProjectService } from './project.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PageController, ProjectController, ProjectApiController, SiteController],
  providers: [PageService, ProjectService],
})
export class InterfaceModule {}
