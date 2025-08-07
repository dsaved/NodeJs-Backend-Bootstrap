module.exports = {
  type: 'postgres',

  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/entity/**/*.{ts,js}'],
  migrations: ['src/migration/**/*.{ts,js}'],
  // seeds: ['src/seeders/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migration',
  },
};
