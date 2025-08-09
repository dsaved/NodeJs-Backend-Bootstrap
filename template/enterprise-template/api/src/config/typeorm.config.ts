import { dbConfig } from '../constructs/env';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  ...dbConfig,
  entities: [`src/model/*{.ts,.js}`],
  migrations: [`src/migrations/*{.ts,.js}`],
  seeds: ['src/seeders/*{.ts,.js}'],
} as any);

dataSource
  .initialize()
  .then(() => {
    console.log('Database connected successfully!');
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });

export default dataSource;
