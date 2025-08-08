import { dbConfig } from '../constructs/env';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  ...dbConfig,
  entities: [`${__dirname}/../model/**/*.{ts,js}`],
  migrations: [`${__dirname}/../migrations/**/*.{ts,js}`],
  seeds: [`${__dirname}/../seeders/**/*.{ts,js}`],
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
