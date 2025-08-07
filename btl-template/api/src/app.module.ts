import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { IndexModule } from './api/index/index.module';
import { UsersModule } from './api/users/users.module';
import { AuthModule } from './api/auth/auth.module';
import { OTPModule } from './api/otp/otp.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './constructs/env';
import { join } from 'path';
import { EmailNotificationModule } from './api/email_notification/email.notification.module';
import { RolessModule } from './api/roles/role.module';
import { CountryMiddleware } from './middlewares/country';
import { APP_GUARD } from '@nestjs/core';
import { DefaultAuthGuard } from './app-guards/auth.guard';
import { ActionsGuard } from './middlewares/actions';
import { UserAuthGuard } from './app-guards/jwt-auth.guard';
import { GroupsModule } from './api/groups/groups.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...dbConfig,
      entities: [join(__dirname, './../models/**.{.ts,.js}')],
      migrations: [join(__dirname, './../migrations/{.ts,*.js}')],
      autoLoadEntities: true,
      logging: true,
    }),
    AuthModule,
    IndexModule,
    UsersModule,
    OTPModule,
    EmailNotificationModule,
    RolessModule,
    GroupsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: DefaultAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ActionsGuard,
    },
  ],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CountryMiddleware)
      .forRoutes(
        { path: '/payment/*', method: RequestMethod.ALL },
      );
  }
}
