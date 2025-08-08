import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { envs } from '../../constructs';
import * as MODELS from '../../model';
import { TwoFactorService } from './two-factor.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: envs.jwtEnv.secret,
      signOptions: { expiresIn: '24h' },
    }),
    TypeOrmModule.forFeature([...Object.values(MODELS)]),
  ],
  providers: [AuthService, TwoFactorService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
