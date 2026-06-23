import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const config = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  database: process.env.DATABASE_NAME || 'product_submission_db',
  username: process.env.DATABASE_USER || 'appuser',
  password: process.env.DATABASE_PASSWORD || 'apppassword',
  dialect: 'mysql' as const,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Create Sequelize instance without auto-loading models
const sequelize = new Sequelize(config);

// Test database connection
export async function testConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error);
    throw error;
  }
}

// Sync database models (use migrations in production)
export async function syncDatabase(): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✓ Database models synchronized');
    }
  } catch (error) {
    console.error('✗ Error synchronizing database:', error);
    throw error;
  }
}

export default sequelize;
export { Sequelize };
