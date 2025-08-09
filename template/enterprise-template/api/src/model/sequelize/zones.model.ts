import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  AllowNull,
  Default,
  Unique,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'zones' })
export class Zone extends Model<Zone> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  public id: number;

  @Default(true)
  @Column({ type: DataType.BOOLEAN, field: 'is_active' })
  public isActive: boolean;

  @Unique('zones_unique_zone_name')
  @Column({ type: DataType.STRING(100), field: 'zone_name' })
  public zoneName: string;

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
