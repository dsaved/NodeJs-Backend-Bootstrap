require('dotenv').config();
const { ...env } = process.env;

export const appEnv = {
  port: env.PORT,
  appName: env.APP_NAME,
  adminSecret: env.ADMIN_SECRET,
};

export const jwtEnv = {
  secret: env.JWT_SECRET ?? '09876543234561782',
  apiClientSecret: env.JWT_API_SECRET ?? '876543213234561782',
};

export const dbConfig = {
  host: env.DB_HOST,
  port: +env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  migrationsRun: +env.DB_AUTO_MIGRATION === 1,
};

export const awsEnv = {
  s3Bucket: env.ATTACHMENT_S3_BUCKET,
  region: env.APP_AWS_REGION,
  secret: env.APP_AWS_SECRET_ACCESS_KEY,
  accessKeyId: env.APP_AWS_ACCESS_KEY_ID,
  accountId: env.APP_AWS_ACCOUNT_ID,
  notificationsQueueName: env.APP_AWS_NOTIFICATIONS_QUEUE_NAME,
};

export const authData = {
  appName: env.APP_NAME,
  preSharedApiKey: env.PRE_SHARED_API_KEY,
};

export const emailEnv = {
  email: {
    host: env.EMAIL_HOST,
    port: +env.EMAIL_PORT,
    secure: true,
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    ignoreTLS: false,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  },
  sender: env.EMAIL_SENDER,
};

export const ipLocation = {
  url: env.IP_LOCATION_URL,
  IpKey: env.IP_LOCATION_KEY,
};


export const fcmbPayment = {
  url: env.API_BASE_URL,
  apiOperation: env.API_OPERATION,
  username: env.USERNAME,
  secret: env.SECRETE,
  merchant: env.MERCHANT,
  interactionOperation: env.INTERACTION_OPERETION,
  merchantName: env.MERCHANT_NAME,
};

export const externalLinks = {
  frontEndUrl: env.FRONT_END_URL,
};

export  const vitalRegEnv = {
  url: env.VITALREG_BASE_URL,
  identity: env.VITALREG_IDENTITY,
  secret: env.VITALREG_SECRET,
}