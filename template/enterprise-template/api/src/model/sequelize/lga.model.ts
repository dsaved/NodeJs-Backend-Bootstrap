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
  AllowNull,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { State } from './states.model';

@Table({ tableName: 'lga' })
export class Lga extends Model<Lga> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  public id: number;

  @Default(true)
  @Column({ type: DataType.BOOLEAN, field: 'is_active' })
  public isActive: boolean;

  @Index
  @ForeignKey(() => State)
  @Column({ type: DataType.INTEGER, field: 'state_id' })
  public stateId: number;

  @BelongsTo(() => State, 'stateId')
  public state: State;

  @Column({ type: DataType.STRING(200), field: 'lga_name' })
  public lgaName: string;

  @Column({ type: DataType.STRING(200), field: 'lga_code' })
  public lgaCode: string;

  @AllowNull
  @Column({ type: DataType.STRING(100) })
  public latitude: string;

  @AllowNull
  @Column({ type: DataType.STRING(100) })
  public longitude: string;

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
