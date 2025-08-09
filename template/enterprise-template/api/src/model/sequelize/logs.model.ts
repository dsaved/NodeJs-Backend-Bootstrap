import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  AutoIncrement,
} from 'sequelize-typescript';
import { User } from './users.model';

@Table({ tableName: 'logs' })
export class Log extends Model<Log> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  public id: number;

  @AllowNull
  @Column({ type: DataType.STRING(100) })
  public action: string;

  @AllowNull
  @Column({ type: DataType.TEXT })
  public description: string;

  @AllowNull
  @Column({ type: DataType.TEXT, field: 'table_name' })
  public tableName: string;

  @AllowNull
  @Column({ type: DataType.INTEGER, field: 'row_id' })
  public rowId: number;

  @AllowNull
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, field: 'user_id' })
  public userId: string;

  @BelongsTo(() => User, 'userId')
  public user: User;

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
