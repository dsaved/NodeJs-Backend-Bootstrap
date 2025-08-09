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
import { Zone } from './zones.model';
import { Country } from './country.model';

@Table({ tableName: 'state' })
export class State extends Model<State> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  public id: number;

  @Default(true)
  @Column({ type: DataType.BOOLEAN, field: 'is_active' })
  public isActive: boolean;

  @Column({ type: DataType.STRING(10), field: 'state_code' })
  public stateCode: string;

  @Column({ type: DataType.STRING(200), field: 'state_name' })
  public stateName: string;

  @Index
  @ForeignKey(() => Country)
  @Column({ type: DataType.INTEGER, field: 'country_id' })
  public countryId: number;

  @BelongsTo(() => Country, 'countryId')
  public country: Country;

  @Index
  @ForeignKey(() => Zone)
  @Column({ type: DataType.INTEGER, field: 'zone_id' })
  public zoneId: number;

  @BelongsTo(() => Zone, 'zoneId')
  public zone: Zone;

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
