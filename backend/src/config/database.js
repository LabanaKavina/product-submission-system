require('dotenv').config();

module.exports = {
  development: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    database: process.env.DATABASE_NAME || 'product_submission_db',
    username: process.env.DATABASE_USER || 'appuser',
    password: process.env.DATABASE_PASSWORD || 'apppassword',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    database: process.env.DATABASE_NAME || 'product_submission_db',
    username: process.env.DATABASE_USER || 'appuser',
    password: process.env.DATABASE_PASSWORD || 'apppassword',
    dialect: 'mysql',
    logging: false
  },
  production: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    database: process.env.DATABASE_NAME || 'product_submission_db',
    username: process.env.DATABASE_USER || 'appuser',
    password: process.env.DATABASE_PASSWORD || 'apppassword',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
