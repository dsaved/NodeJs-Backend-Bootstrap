import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  Unique,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'tokens' })
export class Token extends Model<Token> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  public id: string;

  @Unique('tokens_token_name_unique')
  @Column({ type: DataType.STRING(200), field: 'token_name' })
  public tokenName: string;

  @AllowNull
  @Column({ type: DataType.TEXT })
  public jwt: string;

  @Column({ type: DataType.DATE })
  public expires: Date;

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
