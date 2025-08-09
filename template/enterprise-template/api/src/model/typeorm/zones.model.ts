import {
  Entity,
  Column,
  Unique,
  PrimaryColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({ name: 'zones' })
@Unique('zones_unique_zone_name', ['zoneName'])
export class Zone extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'zone_name', type: 'varchar', length: 100, nullable: false })
  zoneName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude({ toPlainOnly: true })
  deletedAt: Date;
}
