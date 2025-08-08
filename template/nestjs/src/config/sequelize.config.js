const { dbConfig } = require('../constructs/env');

module.exports = {
  development: {
    dialect: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true,
    },
  },
  test: {
    dialect: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: `${dbConfig.database}_test`,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true,
    },
  },
  production: {
    dialect: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true,
    },
  },
};