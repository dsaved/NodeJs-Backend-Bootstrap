import { Module } from '@nestjs/common';
import { EmailNotificationService } from './email.notification.service';
import { EmailNotificationController } from './email.notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as MODELS from '../../model';

@Module({
  imports: [TypeOrmModule.forFeature([...Object.values(MODELS)])],
  providers: [EmailNotificationService],
  exports: [EmailNotificationService],
  controllers: [EmailNotificationController],
})
export class EmailNotificationModule {}
