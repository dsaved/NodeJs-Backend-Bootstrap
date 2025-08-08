import {
  Entity,
  Column,
  Unique,
  Index,
} from 'typeorm';
import { BaseModel } from './base.model';
import { enums } from '../constructs';

@Entity({ name: 'users' })
@Unique('users_unique_phone_number', ['phoneNumber'])
@Unique('users_unique_email', ['emailAddress'])
@Index('users_state_index', ['state'])
@Index('users_lga_index', ['lga'])
@Index('users_ward_index', ['ward'])
@Index('users_phc_index', ['phc'])
@Index('users_group_index', ['group'])
export class User extends BaseModel {
  @Column({ name: 'first_name', type: 'varchar', length: 50, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50, nullable: true })
  lastName: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 50, nullable: true })
  middleName: string;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: enums.GenderEnum,
    nullable: true,
  })
  gender: enums.GenderEnum;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 15,
    nullable: true,
  })
  phoneNumber: string;

  @Column({ name: 'email', type: 'varchar', length: 50, nullable: false })
  emailAddress: string;

  @Column({ name: 'password', type: 'varchar', nullable: true })
  password: string;

  @Column({ name: 'verified', type: 'boolean', default: false, nullable: true })
  verified: boolean;

  @Column({
    name: 'require_password_change',
    type: 'boolean',
    default: false,
    nullable: true,
  })
  requirePasswordChange: boolean;

  @Column({ name: 'two_factor_secret', type: 'varchar', nullable: true })
  twoFactorSecret: string;

  @Column({
    name: 'is_two_factor_enabled',
    type: 'boolean',
    default: false,
    nullable: true,
  })
  isTwoFactorEnabled: boolean;

  @Column({
    name: 'status',
    type: 'enum',
    enum: enums.AccountStatusEnum,
    default: enums.AccountStatusEnum.ACTIVE,
  })
  status: string;
}
