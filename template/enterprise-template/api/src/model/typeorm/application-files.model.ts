import { Entity, Column } from 'typeorm';
import { BaseModel } from './base.model';

@Entity({ name: 'application_files' })
export class ApplicationFile extends BaseModel {
  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'key', type: 'text', nullable: false })
  key: string;

  @Column({ name: 'e_tag', type: 'text', nullable: false })
  eTag: string;

  @Column({ name: 'mime_type', type: 'text', nullable: false })
  mimeType: string;
}
