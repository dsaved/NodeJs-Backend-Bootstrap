import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Unique,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { Group } from './groups.model';
import { State } from './states.model';
import { Lga } from './lga.model';

@Table({ tableName: 'roles' })
export class Role extends Model<Role> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  public id: string;

  @Unique('roles_unique_role_name')
  @Column({ type: DataType.STRING(100), field: 'role_name' })
  public roleName: string;

  @ForeignKey(() => Group)
  @Column({ type: DataType.UUID, field: 'group_id' })
  public groupId: string;

  @BelongsTo(() => Group, 'groupId')
  public group: Group;

  @AllowNull
  @ForeignKey(() => State)
  @Column({ type: DataType.INTEGER, field: 'state_id' })
  public stateId: number;

  @BelongsTo(() => State, 'stateId')
  public state: State;

  @AllowNull
  @ForeignKey(() => Lga)
  @Column({ type: DataType.INTEGER, field: 'lga_id' })
  public lgaId: number;

  @BelongsTo(() => Lga, 'lgaId')
  public lga: Lga;

  @AllowNull
  @Column({ type: DataType.JSONB })
  public permission: any;

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
