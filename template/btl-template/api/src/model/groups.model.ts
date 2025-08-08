import { Entity, Column, Unique, Index } from 'typeorm';
import { BaseModel } from './base.model';

@Entity({ name: 'groups' })
@Unique('groups_unique_group_name', ['groupName'])
export class Group extends BaseModel {
  @Column({ name: 'group_name', type: 'varchar', length: 100, nullable: false })
  groupName: string;

  @Index()
  @Column({ name: 'scope_level', type: 'bigint', nullable: false, default: 0 })
  scopeLevel: number;
}
