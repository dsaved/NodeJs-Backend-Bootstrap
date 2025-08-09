import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  Unique,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

@Table({ 
  tableName: 'otps',
  indexes: [
    {
      name: 'otp_un',
      unique: true,
      fields: ['email', 'otp']
    }
  ]
})
export class Otp extends Model<Otp> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  public id: string;

  @AllowNull
  @Column({ type: DataType.STRING(50) })
  public email: string;

  @Column({ type: DataType.STRING(10) })
  public otp: string;

  @Default(() => new Date())
  @Column({ type: DataType.DATE, field: 'otp_issued_at' })
  public otpIssuedAt: Date;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_used' })
  public isUsed: boolean;

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
