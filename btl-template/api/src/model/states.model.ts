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
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Zone } from './zones.model';
import { Country } from './country.model';
import { Exclude } from 'class-transformer';

@Entity({ name: 'state' })
@Index('states_country_index', ['country'])
@Index('states_zone_index', ['zone'])
export class State extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'state_code', type: 'varchar', length: 10, nullable: false })
  stateCode: string;

  @Column({ name: 'state_name', type: 'varchar', length: 200, nullable: false })
  stateName: string;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @ManyToOne(() => Zone, { nullable: false })
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude({ toPlainOnly: true })
  deletedAt: Date;
}
