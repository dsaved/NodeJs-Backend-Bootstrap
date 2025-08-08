require('dotenv').config();
const { ...env } = process.env;

export const appEnv = {
  port: env.PORT,
  appName: env.APP_NAME,
  adminSecret: env.ADMIN_SECRET,
};

export const jwtEnv = {
  secret: env.JWT_SECRET ?? '1234590857462738',
  apiClientSecret: env.JWT_API_SECRET ?? '5432190857462738',
};

export const dbConfig = {
  host: env.DB_HOST,
  port: +env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  migrationsRun: +env.DB_AUTO_MIGRATION === 1,
};

export const authData = {
  appName: env.APP_NAME,
  preSharedApiKey: env.PRE_SHARED_API_KEY,
};
