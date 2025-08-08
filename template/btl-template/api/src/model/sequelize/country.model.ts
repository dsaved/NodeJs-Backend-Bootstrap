import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'country' })
export class Country extends Model<Country> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  public id: number;

  @Column({ type: DataType.STRING(200), field: 'country_name' })
  public countryName: string;

  @Column({ type: DataType.STRING(200) })
  public nationality: string;

  @Column({ type: DataType.STRING(2), field: 'alpha_2_code' })
  public alpha2code: string;

  @Column({ type: DataType.STRING(3), field: 'alpha_3_code' })
  public alpha3code: string;

  @Column({ type: DataType.STRING(3), field: 'numeric_code' })
  public numericCode: string;

  @Column({ type: DataType.STRING(3), field: 'calling_code' })
  public callingCode: string;

  @Default(true)
  @Column({ type: DataType.BOOLEAN, field: 'is_active' })
  public isActive: boolean;

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
