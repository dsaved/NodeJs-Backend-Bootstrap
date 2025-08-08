import { Entity, Column, Index } from 'typeorm';
import { BaseModel } from './base.model';

@Entity({ name: 'tokens' })
@Index('tokens_token_name_unique', ['tokenName'], { unique: true })
export class Token extends BaseModel {
  @Column({ name: 'token_name', type: 'varchar', length: 200, nullable: false })
  tokenName: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  public jwt: string;

  @Column({
    type: 'timestamptz',
    nullable: false,
  })
  public expires: Date;
}
