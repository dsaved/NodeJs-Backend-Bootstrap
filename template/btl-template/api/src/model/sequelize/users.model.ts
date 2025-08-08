import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
  AllowNull,
  Unique,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { enums } from '../constructs';
import { ApplicationFile } from './application-files.model';
import { Zone } from './zones.model';
import { State } from './states.model';
import { Lga } from './lga.model';
import { Ward } from './wards.model';
import { Group } from './groups.model';
import { Role } from './roles.model';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  public id: string;

  @AllowNull
  @Column({ type: DataType.STRING(50), field: 'first_name' })
  public firstName: string;

  @AllowNull
  @Column({ type: DataType.STRING(50), field: 'last_name' })
  public lastName: string;

  @AllowNull
  @Column({ type: DataType.STRING(50), field: 'middle_name' })
  public middleName: string;

  @AllowNull
  @Column({ 
    type: DataType.INTEGER,
    validate: { isIn: [[0, 1]] } // GenderEnumNum: 0 = male, 1 = female
  })
  public gender: number;

  @AllowNull
  @Unique('users_unique_phone_number')
  @Column({ type: DataType.STRING(15), field: 'phone_number' })
  public phoneNumber: string;

  @Unique('users_unique_email')
  @Column({ type: DataType.STRING(50), field: 'email' })
  public emailAddress: string;

  @AllowNull
  @Column({ type: DataType.STRING(11) })
  public nin: string;

  @AllowNull
  @ForeignKey(() => ApplicationFile)
  @Column({ type: DataType.UUID, field: 'profile_image' })
  public profileImageId: string;

  @BelongsTo(() => ApplicationFile, 'profileImageId')
  public profileImage: ApplicationFile;

  @AllowNull
  @ForeignKey(() => Zone)
  @Column({ type: DataType.UUID, field: 'zone' })
  public zoneId: string;

  @BelongsTo(() => Zone, 'zoneId')
  public zone: Zone;

  @AllowNull
  @Index
  @ForeignKey(() => State)
  @Column({ type: DataType.UUID, field: 'state_id' })
  public stateId: string;

  @BelongsTo(() => State, 'stateId')
  public state: State;

  @AllowNull
  @Index
  @ForeignKey(() => Lga)
  @Column({ type: DataType.UUID, field: 'lga_id' })
  public lgaId: string;

  @BelongsTo(() => Lga, 'lgaId')
  public lga: Lga;

  @AllowNull
  @Index
  @ForeignKey(() => Ward)
  @Column({ type: DataType.UUID, field: 'ward_id' })
  public wardId: string;

  @BelongsTo(() => Ward, 'wardId')
  public ward: Ward;

  @Index
  @ForeignKey(() => Group)
  @Column({ type: DataType.UUID, field: 'group_id' })
  public groupId: string;

  @BelongsTo(() => Group, 'groupId')
  public group: Group;

  @AllowNull
  @Column({ type: DataType.STRING })
  public password: string;

  @AllowNull
  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  public verified: boolean;

  @AllowNull
  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'require_password_change' })
  public requirePasswordChange: boolean;

  @AllowNull
  @Column({ type: DataType.STRING, field: 'two_factor_secret' })
  public twoFactorSecret: string;

  @AllowNull
  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_two_factor_enabled' })
  public isTwoFactorEnabled: boolean;

  @AllowNull
  @ForeignKey(() => Role)
  @Column({ type: DataType.UUID, field: 'role_id' })
  public roleId: string;

  @BelongsTo(() => Role, 'roleId')
  public role: Role;

  @Default(enums.AccountStatusEnumNum.active)
  @Column({ 
    type: DataType.INTEGER,
    validate: { isIn: [Object.values(enums.AccountStatusEnumNum)] }
  })
  public status: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  public createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  public updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at' })
  public deletedAt: Date;
}
