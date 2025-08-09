import { Injectable, InternalServerErrorException } from '@nestjs/common';
import emailTpl from '../templates/email.tpl';
import awsS3bucket from './aws.s3';
import { v4 as uuidv4 } from 'uuid';
import { enums, envs } from '../constructs';
import { Attachment } from '../constructs/interfaces';
import { convert } from 'html-to-text';
import { QueryRunner } from 'typeorm';
import { Notification } from '../model';

@Injectable()
class MailHelper {
  private to: string;
  private subject: string;
  private timeZone: string = 'en-NG';
  private emailType: enums.EmailType = enums.EmailType.DEFAULT;
  private message: string;
  private notificationType: enums.NotificationTypeEnumNum =
    enums.NotificationTypeEnumNum.email;
  private attachments: Attachment[] = [];
  private extras: any;

  private formatMessage(template: string, data: object): string {
    for (const key in data) {
      const value = data[key];
      const re = new RegExp('{{' + key + '}}', 'g');
      template = template.replace(re, value);
    }
    return template;
  }

  setTo(_to: string): this {
    this.to = _to;
    return this;
  }

  setTimeZone(_timeZone: string): this {
    this.timeZone = _timeZone;
    return this;
  }

  setSubject(_subject: string): this {
    this.subject = _subject;
    return this;
  }

  setType(type: enums.NotificationTypeEnumNum): this {
    this.notificationType = type;
    return this;
  }

  setEmailType(_type: enums.EmailType): this {
    this.emailType = _type;
    return this;
  }

  setExtras(_extras: any): this {
    this.extras = _extras;
    this.extras['payee'] = this.to;
    return this;
  }

  setBase64Attachment(
    filename: string,
    raw: string,
    contentType?: string,
  ): this {
    this.attachments.push({
      filename: filename,
      content: Buffer.from(raw, 'base64'),
      encoding: 'base64',
      contentType: contentType,
    });
    return this;
  }

  setMessage(_message: string): this {
    this.message = _message;
    return this;
  }

  async enque(queryRunner?: QueryRunner): Promise<any> {
    if (!this.to) {
      throw new InternalServerErrorException('to must not be null');
    }
    if (!this.subject) {
      throw new InternalServerErrorException('subject must not be null');
    }
    if (!this.message && this.emailType != enums.EmailType.PAYMENT) {
      throw new InternalServerErrorException('message must not be null');
    }
    if (!this.extras && this.emailType === enums.EmailType.PAYMENT) {
      throw new InternalServerErrorException('extras must not be null');
    }

    const date = new Date();
    const nigeriaDate = date.toLocaleString(this.timeZone, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });

    // Upload files to S3
    const attachments: Attachment[] = [];
    for (const element of this.attachments) {
      const attachment = element;
      const fileName = `${uuidv4()}-${attachment.filename}`;

      await awsS3bucket.uploadBase64({
        base64String: attachment.content.toString('base64'),
        objectKey: fileName,
        stringContent: true,
      });

      // Set the attachment for the email notification
      attachments.push({
        filename: attachment.filename,
        path: fileName,
        encoding: attachment.encoding,
      });
    }
    this.attachments = []; // Clear the files after attaching them to the mail

    const emailDatas = {
      header: this.subject,
      message: this.message,
      date: nigeriaDate,
      appName: envs.appEnv.appName,
      ...this.extras,
    };

    const template: string = this.formatMessage(
      this.emailType === enums.EmailType.PAYMENT ? '' : emailTpl,
      emailDatas,
    );
    const text = convert(this.message);

    let emailID = null;

    // Check if a queryRunner (transaction) was passed
    try {
      if (queryRunner) {
        // If queryRunner is passed, use the transaction
        const email = queryRunner.manager.create(Notification, {
          from: envs.emailEnv.sender,
          to: this.to,
          subject: this.subject,
          text: text,
          type: this.notificationType,
          html: `${template}`,
          status: enums.EmailStatusNum.pending,
          attachments: attachments,
        });
        await queryRunner.manager.save(email); // Save email notification to the database

        emailID = email.id;
      } else {
        // If no queryRunner (transaction), save the email normally
        const email = Notification.create({
          from: envs.emailEnv.sender,
          to: this.to,
          subject: this.subject,
          text: text,
          type: this.notificationType,
          html: `${template}`,
          status: enums.EmailStatusNum.pending,
          attachments: attachments,
        });

        await email.save(); // Save email notification to the database

        emailID = email.id;
      }
    } catch (error: any) {
      console.log(error);
      return { success: false, message: error.message };
    }

    return { success: true, message: `Email Created for: ${this.to}`, emailID };
  }
}

export default new MailHelper();
