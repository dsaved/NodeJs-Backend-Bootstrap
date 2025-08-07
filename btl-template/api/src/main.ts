require('dotenv').config();
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { requestLogger } from './middlewares/request-logger';
import { appEnv } from './constructs/env';

async function bootstrap() {
  //^ create app and enable cors
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 200,
    },
    logger: new Logger(),
  });

  //^ enable app to use validation pip
  app.useGlobalPipes(new ValidationPipe());

  // use helmet for security
  app.use(
    helmet({
      contentSecurityPolicy: false, // disable content security policy
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // increase the request size limit
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(requestLogger());

  //^ Satert app
  await app
    .listen(appEnv.port)
    .then(async () =>
      console.log(`main server listening on ${await app.getUrl()}\n`),
    );
}

bootstrap();
