import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// JWT configuration
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRATION || '24h'
};

// Validate JWT secret
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
  console.warn('⚠ WARNING: Using default JWT secret. Please set JWT_SECRET in .env file for production!');
}
