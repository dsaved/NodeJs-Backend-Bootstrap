import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { sendNotification } from '../../helpers/notifications';
import { LisEmailNotificationRequestDto } from '../../dto/request/email-notification-request.dto';
import { getPagination } from '../../helpers/utils';
import { enums } from '../../constructs';
import { Notification } from '../../model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EmailNotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly emailNotificationRepository: Repository<Notification>,
  ) {}

  async reSendEmailNotification(emailID: string): Promise<any> {
    try {
      await sendNotification({
        id: emailID,
        type: enums.getNotificationTypeEnumNum(
          enums.NotificationTypeEnumNum.email,
        ),
      });
    } catch (error) {
      throw new InternalServerErrorException('Error re-sending email');
    }
    return {
      success: true,
    };
  }

  async listFailedOrPendingEmails(
    data: LisEmailNotificationRequestDto,
  ): Promise<any> {
    const search: string = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset: number = (page - 1) * limit;

    // Build the query
    const queryBuilder =
      this.emailNotificationRepository.createQueryBuilder('email');

    queryBuilder
      .where('email.status NOT IN (:...statuses)', {
        statuses: [
          enums.EmailStatusNum[enums.EmailStatus.COMPLETED],
          enums.EmailStatusNum[enums.EmailStatus.PROCESSING],
        ],
      })
      .orderBy('email.id', 'DESC')
      .take(limit)
      .skip(offset);

    // Add search filter if provided
    if (search) {
      queryBuilder.andWhere('email.to ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Select attributes
    queryBuilder.select([
      'email.id',
      'email.createdAt',
      'email.status',
      'email.to',
      'email.from',
      'email.subject',
      'email.text',
    ]);

    // Execute the query
    const [result, total] = await queryBuilder.getManyAndCount();

    // Return results with pagination
    return {
      result,
      pagination: getPagination(total, page, offset, limit),
    };
  }
}
