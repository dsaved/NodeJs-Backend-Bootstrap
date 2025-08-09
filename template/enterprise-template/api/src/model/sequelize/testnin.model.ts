import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  Unique,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'test_nins' })
export class TestNin extends Model<TestNin> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  public id: string;

  @Unique('test_nins_nin_unique')
  @Column({ type: DataType.STRING(11) })
  public nin: string;

  @Column({ type: DataType.JSONB, field: 'nin_data' })
  public ninData: any;

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
