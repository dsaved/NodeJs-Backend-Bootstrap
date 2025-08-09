import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'country' })
export class Country extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({
    name: 'country_name',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  countryName: string;

  @Column({
    name: 'nationality',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  nationality: string;

  @Column({
    name: 'alpha_2_code',
    type: 'varchar',
    length: 2,
    nullable: false,
  })
  alpha2code: string;

  @Column({
    name: 'alpha_3_code',
    type: 'varchar',
    length: 3,
    nullable: false,
  })
  alpha3code: string;

  @Column({
    name: 'currency_code',
    type: 'varchar',
    length: 3,
    nullable: false,
  })
  currencyCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude({ toPlainOnly: true })
  deletedAt: Date;
}
