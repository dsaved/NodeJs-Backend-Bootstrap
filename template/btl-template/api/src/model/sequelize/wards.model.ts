import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { Lga } from './lga.model';

@Table({ tableName: 'wards' })
export class Ward extends Model<Ward> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  public id: number;

  @Default(true)
  @Column({ type: DataType.BOOLEAN, field: 'is_active' })
  public isActive: boolean;

  @Column({ type: DataType.STRING(200), field: 'ward_name' })
  public wardName: string;

  @Index
  @ForeignKey(() => Lga)
  @Column({ type: DataType.INTEGER, field: 'lga_id' })
  public lgaId: number;

  @BelongsTo(() => Lga, 'lgaId')
  public lga: Lga;

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
