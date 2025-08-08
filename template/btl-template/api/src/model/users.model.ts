import {
  Entity,
  Column,
  Unique,
  JoinColumn,
  OneToOne,
  ManyToOne,
  Index,
} from 'typeorm';
import { BaseModel } from './base.model';
import { ApplicationFile } from './application-files.model';
import { enums } from '../constructs';
import { Role } from './roles.model';
import { Zone } from './zones.model';
import { State } from './states.model';
import { Lga } from './lga.model';
import { Ward } from './wards.model';
import { Group } from './groups.model';

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
    enum: enums.GenderEnumNum,
    nullable: true,
  })
  gender: enums.GenderEnumNum;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 15,
    nullable: true,
  })
  phoneNumber: string;

  @Column({ name: 'email', type: 'varchar', length: 50, nullable: false })
  emailAddress: string;

  @Column({ name: 'nin', type: 'varchar', length: 11, nullable: true })
  nin: string;

  @OneToOne(() => ApplicationFile, { nullable: true })
  @JoinColumn({ name: 'profile_image' })
  profileImage: ApplicationFile;

  @ManyToOne(() => Zone, { nullable: true })
  @JoinColumn({ name: 'zone' })
  zone: Zone;

  @ManyToOne(() => State, { nullable: true })
  @JoinColumn({ name: 'state_id' })
  state: State;

  @ManyToOne(() => Lga, { nullable: true })
  @JoinColumn({ name: 'lga_id' })
  lga: Lga;

  @ManyToOne(() => Ward, { nullable: true })
  @JoinColumn({ name: 'ward_id' })
  ward: Ward;

  @ManyToOne(() => Group, { nullable: false })
  @JoinColumn({ name: 'group_id' })
  group: Group;

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

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({
    name: 'status',
    type: 'enum',
    enum: enums.AccountStatusEnumNum,
    default: enums.AccountStatusEnumNum.active,
  })
  status: number;
}
