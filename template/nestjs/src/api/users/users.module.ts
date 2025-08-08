import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envs } from '../../constructs';
import { JwtStrategy } from '../../app-guards/jwt.user-strategy';
import * as MODELS from '../../model';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: envs.jwtEnv.secret,
      signOptions: { expiresIn: '24h' },
    }),
    TypeOrmModule.forFeature([...Object.values(MODELS)]),
  ],
  providers: [UsersService, JwtStrategy],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
