import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Lga } from './lga.model';

@Entity({ name: 'wards' })
@Index('wards_lga_index', ['lga'])
export class Ward extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'ward_name', type: 'varchar', length: 200, nullable: false })
  wardName: string;

  @ManyToOne(() => Lga, { nullable: false })
  @JoinColumn({ name: 'lga_id' })
  lga: Lga;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude({ toPlainOnly: true })
  deletedAt: Date;
}
