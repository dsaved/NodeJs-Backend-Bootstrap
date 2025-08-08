import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  BaseEntity,
  Index,
} from 'typeorm';
import { State } from './states.model';
import { Exclude } from 'class-transformer';

@Entity({ name: 'lga' })
@Index('lga_state_index', ['state'])
export class Lga extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => State, { nullable: false })
  @JoinColumn({ name: 'state_id' })
  state: State;

  @Column({ name: 'lga_name', type: 'varchar', length: 200, nullable: false })
  lgaName: string;

  @Column({ name: 'lga_code', type: 'varchar', length: 200, nullable: false })
  lgaCode: string;

  @Column({ name: 'latitude', type: 'varchar', length: 100, nullable: true })
  latitude: string;

  @Column({ name: 'longitude', type: 'varchar', length: 100, nullable: true })
  longitude: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude({ toPlainOnly: true })
  deletedAt: Date;
}
