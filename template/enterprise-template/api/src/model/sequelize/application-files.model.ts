import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'application_files' })
export class ApplicationFile extends Model<ApplicationFile> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  public id: string;

  @Column({ type: DataType.STRING(100) })
  public name: string;

  @Column({ type: DataType.TEXT })
  public key: string;

  @Column({ type: DataType.TEXT, field: 'e_tag' })
  public eTag: string;

  @Column({ type: DataType.TEXT, field: 'mime_type' })
  public mimeType: string;

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
