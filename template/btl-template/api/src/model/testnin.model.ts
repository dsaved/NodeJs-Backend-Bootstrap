import { Entity, Column, Index } from 'typeorm';
import { BaseModel } from './base.model';
import { classes } from '../constructs';

@Entity({ name: 'test_nins' })
@Index('test_nins_nin_unique', ['nin'], { unique: true })
export class TestNin extends BaseModel {
  @Column({
    name: 'nin',
    type: 'varchar',
    nullable: false,
    unique: true,
    length: 11
  })
  nin: string;

  @Column({
    name: 'nin_data',
    type: 'jsonb',
    nullable: false,
  })
  ninData: classes.NinObject;
}
