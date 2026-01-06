import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Liquid } from 'liquidjs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  const engine = new Liquid({
    root: join(__dirname, '..', 'views'),
    extname: '.liquid',
  });
  app.engine('liquid', engine.express());
  app.setViewEngine('liquid');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(process.env.PORT ?? 3000);
}

if (require.main === module) {
  bootstrap();
}

export default async (req: any, res: any) => {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  const engine = new Liquid({
    root: join(__dirname, '..', 'views'),
    extname: '.liquid',
  });
  app.engine('liquid', engine.express());
  app.setViewEngine('liquid');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.init();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
};
