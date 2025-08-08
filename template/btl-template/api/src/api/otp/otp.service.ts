import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { OTPRequestDto } from '../../dto/request/otp-request.dto';
import { numberCode } from '../../helpers/utils';
import mailHelper from '../../helpers/mail.helper';
import { Otp } from 'src/model/otp.model';

@Injectable()
export class OTPService {
  constructor(private readonly dataSource: DataSource) {}

  async sendOtp(data: OTPRequestDto) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const otp = numberCode(6);

      // Save the OTP using the query runner
      const otpEntity = queryRunner.manager.create(Otp, {
        email: data.email,
        otp: otp,
        isUsed: false,
        otpIssuedAt: new Date(),
      });
      await queryRunner.manager.save(otpEntity);

      // Send email with OTP
      await mailHelper
        .setSubject('Your One-Time Password (OTP) for Verification')
        .setMessage(
          `
          <p>Dear User,</p>
          <p>You have requested to validate your email address for our service. Please use the following OTP (One-Time Password) to complete the validation process:</p>
          <p><strong>OTP:</strong> ${otp}</p>
          <p>Please note that this OTP is valid for a single use only and will expire after a short period of time. If you did not initiate this request, please disregard this email.</p>
          <p>Thank you for choosing our service.</p>
          <p>Best regards,<br>`,
        )
        .setTo(data.email)
        .enque(queryRunner);

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error: any) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new InternalServerErrorException(error.message);
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async validateOtp(data: OTPRequestDto) {
    const otpEntity = await this.dataSource.getRepository(Otp).findOne({
      where: { email: data.email, otp: data.otp },
    });

    if (!otpEntity) {
      throw new NotFoundException('OTP not found');
    }

    if (otpEntity.isUsed) {
      throw new NotAcceptableException('OTP has already been used');
    }

    const otpValidityDuration = 5 * 60 * 1000; // 5 minutes
    const dbTimezoneOffset = otpEntity.otpIssuedAt.getTimezoneOffset(); // Assuming you store the offset
    const adjustedClientTime = new Date(Date.now() + dbTimezoneOffset);
    if (
      adjustedClientTime.getTime() - otpEntity.otpIssuedAt.getTime() >
      otpValidityDuration
    ) {
      throw new NotAcceptableException('OTP has expired');
    }

    if (otpEntity.otp !== data.otp) {
      throw new NotAcceptableException('Invalid OTP');
    }

    otpEntity.isUsed = true;
    await this.dataSource.getRepository(Otp).save(otpEntity);

    return { success: true };
  }

  async resendOtp(email: string) {
    const existingOtp = await this.dataSource.getRepository(Otp).findOne({
      where: { email },
      order: { id: 'DESC' },
    });

    if (existingOtp && !existingOtp.isUsed) {
      const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const dbTimezoneOffset = existingOtp.otpIssuedAt.getTimezoneOffset();
        existingOtp.otpIssuedAt = new Date(Date.now() + dbTimezoneOffset);

        // Resend email with existing OTP
        await mailHelper
          .setSubject('Your One-Time Password (OTP) for Verification')
          .setMessage(
            `
            <p>Dear User,</p>
            <p>You have requested to validate your email address for our service. Please use the following OTP (One-Time Password) to complete the validation process:</p>
            <p><strong>OTP:</strong> ${existingOtp.otp}</p>
            <p>Please note that this OTP is valid for a single use only and will expire after a short period of time. If you did not initiate this request, please disregard this email.</p>
            <p>Thank you for choosing our service.</p>
            <p>Best regards,<br>`,
          )
          .setTo(email)
          .enque(queryRunner);

        // Save the updated OTP entity
        await queryRunner.manager.save(existingOtp);
        await queryRunner.commitTransaction();

        return { success: true };
      } catch (error: any) {
        // Rollback transaction on error
        await queryRunner.rollbackTransaction();
        console.error(error);
        throw new InternalServerErrorException(error.message);
      } finally {
        // Release query runner
        await queryRunner.release();
      }
    }

    // Generate and send a new OTP
    return await this.sendOtp({ email: email } as OTPRequestDto);
  }
}
