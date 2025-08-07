import { Entity, Column, AfterInsert } from 'typeorm';
import { BaseModel } from './base.model';
import { enums } from '../constructs';
import { Attachment } from '../constructs/interfaces';
import { sendNotification } from '../helpers/notifications';

@Entity({ name: 'notifications' })
export class Notification extends BaseModel {
  @Column({
    type: 'enum',
    enum: enums.EmailStatusNum,
  })
  status: enums.EmailStatusNum;

  @Column({
    type: 'varchar',
    length: 50,
  })
  to: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  from: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  subject: string;

  @Column({
    type: 'text',
  })
  text: string;

  @Column({
    type: 'boolean',
  })
  seen: boolean;

  @Column({
    type: 'enum',
    enum: enums.NotificationTypeEnumNum,
    default: enums.NotificationTypeEnumNum.email,
  })
  type: enums.NotificationTypeEnumNum;

  @Column({
    type: 'text',
  })
  html: string;

  @Column({
    type: 'jsonb',
    nullable: true, // `typeorm` doesn't support array of JSON directly; using JSONB for PostgreSQL
  })
  attachments: Attachment[];

  @AfterInsert()
  async createEmailNotification(): Promise<void> {
    try {
      await sendNotification({ id: this.id, type: enums.getNotificationTypeEnumNum(this.type) });
    } catch (error) {
      console.log(error);
    }
  }
}
