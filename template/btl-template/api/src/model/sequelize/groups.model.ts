import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  Unique,
  Index,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'groups' })
export class Group extends Model<Group> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  public id: string;

  @Unique('groups_unique_group_name')
  @Column({ type: DataType.STRING(100), field: 'group_name' })
  public groupName: string;

  @Index
  @Default(0)
  @Column({ type: DataType.BIGINT, field: 'scope_level' })
  public scopeLevel: number;

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
