import { Entity, Column, Index } from 'typeorm';
import { BaseModel } from './base.model';

@Entity({ name: 'otps' })
@Index('otp_un', ['email', 'otp'], { unique: true }) // Composite unique constraint
export class Otp extends BaseModel {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  otp: string;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  otpIssuedAt: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  isUsed: boolean;
}
