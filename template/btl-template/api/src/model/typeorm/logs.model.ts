import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './users.model';
import { BaseModel } from './base.model';

@Entity('logs') // Equivalent to @Table in Sequelize
export class Log extends BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  action: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  tableName: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  rowId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User; // This replaces the BelongsTo relationship from Sequelize
}
