import { Module } from '@nestjs/common';
import { OTPService } from './otp.service';
import { OTPController } from './otp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as MODELS from '../../model';

@Module({
  imports: [TypeOrmModule.forFeature([...Object.values(MODELS)])],
  providers: [OTPService],
  exports: [OTPService],
  controllers: [OTPController],
})
export class OTPModule {}
