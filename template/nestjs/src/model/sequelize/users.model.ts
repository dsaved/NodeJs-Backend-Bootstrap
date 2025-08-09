import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  AllowNull,
  Unique,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
} from 'sequelize-typescript';
import { enums } from '../../constructs';

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
    type: DataType.ENUM(...Object.values(enums.GenderEnum)),
    validate: { isIn: [Object.values(enums.GenderEnum)] },
  })
  public gender: enums.GenderEnum;

  @AllowNull
  @Unique('users_unique_phone_number')
  @Column({ type: DataType.STRING(15), field: 'phone_number' })
  public phoneNumber: string;

  @Unique('users_unique_email')
  @Index
  @Column({ type: DataType.STRING(50), field: 'email' })
  public emailAddress: string;

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

  @Default(enums.AccountStatusEnum.ACTIVE)
  @Column({
    type: DataType.ENUM(...Object.values(enums.AccountStatusEnum)),
    validate: { isIn: [Object.values(enums.AccountStatusEnum)] },
  })
  public status: enums.AccountStatusEnum;

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
