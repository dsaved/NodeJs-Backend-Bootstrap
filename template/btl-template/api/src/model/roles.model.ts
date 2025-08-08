import { Entity, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from './base.model';
import { Permission } from '../constructs/class';
import { State } from './states.model';
import { Lga } from './lga.model';
import { Group } from './groups.model';

@Entity({ name: 'roles' })
@Unique('roles_unique_role_name', ['roleName'])
export class Role extends BaseModel {
  @Column({ name: 'role_name', type: 'varchar', length: 100, nullable: false })
  roleName: string;

  @ManyToOne(() => Group, { nullable: false })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => State, { nullable: true })
  @JoinColumn({ name: 'state_id' })
  state: State;

  @ManyToOne(() => Lga, { nullable: true })
  @JoinColumn({ name: 'lga_id' })
  lga: Lga;

  @Column({ name: 'permission', type: 'jsonb', nullable: true })
  permission: Permission;
}
