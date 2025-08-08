import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { IndexModule } from './api/index/index.module';
import { UsersModule } from './api/users/users.module';
import { AuthModule } from './api/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './constructs/env';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { DefaultAuthGuard } from './app-guards/auth.guard';
import { UserAuthGuard } from './app-guards/jwt-auth.guard';

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
  ],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {}
}
