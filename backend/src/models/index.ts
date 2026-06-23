import sequelize from '../config/database';
import { User } from './User';
import { Product } from './Product';
import { Variant } from './Variant';

// Initialize models
export async function initializeModels(): Promise<void> {
  try {
    // Add models to Sequelize instance
    sequelize.addModels([User, Product, Variant]);
    
    console.log('✓ Models initialized successfully');
  } catch (error) {
    console.error('✗ Error initializing models:', error);
    throw error;
  }
}

// Export sequelize instance
export { sequelize };

// Export models
export { User, UserRole } from './User';
export { Product, ProductStatus } from './Product';
export { Variant } from './Variant';
