import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import express, { json, urlencoded } from 'express';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import helmet from 'helmet';
import { requestLogger } from './middlewares/request-logger';

let server: Handler;
async function bootstrap() {
  const expressApp = express();
  //^ create app and enable cors
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
      },
      logger: ['error', 'warn'],
    },
  );
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

  //^ enable app to use validation pip
  app.useGlobalPipes(new ValidationPipe());

  // increase the request size limit
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(requestLogger());

  await app.init();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
