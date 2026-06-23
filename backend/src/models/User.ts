import { Table, Column, Model, DataType, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';

// Type-only import to avoid circular dependency
import type { Product } from './Product';

export enum UserRole {
  USER = 'User',
  ADMIN = 'Admin'
}

@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.USER
  })
  role!: UserRole;

  @Column({
    type: DataType.DATE,
    field: 'createdAt'
  })
  @CreatedAt
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    field: 'updatedAt'
  })
  @UpdatedAt
  updatedAt!: Date;

  // Associations
  @HasMany(() => require('./Product').Product, {
    foreignKey: 'userId',
    as: 'products',
    onDelete: 'CASCADE'
  })
  products!: Product[];
}
