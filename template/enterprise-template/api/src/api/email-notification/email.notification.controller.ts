import { Controller, Get, Param, Query } from '@nestjs/common';
import { EmailNotificationService } from './email.notification.service';
import { LisEmailNotificationRequestDto } from '../../dto/request/email-notification-request.dto';

@Controller({ path: '/email-notifications' })
export class EmailNotificationController {
  constructor(private readonly service: EmailNotificationService) {}

  @Get('/resend/:emailID')
  async reSendEmailNotification(@Param('emailID') emailID: string) {
    return await this.service.reSendEmailNotification(emailID);
  }

  @Get('/failed-pending')
  async listFailedOrPendingEmails(
    @Query() data: LisEmailNotificationRequestDto,
  ) {
    return await this.service.listFailedOrPendingEmails(data);
  }
}
