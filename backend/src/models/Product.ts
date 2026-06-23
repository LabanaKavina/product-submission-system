import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { User } from './User';
import { Variant } from './Variant';

export enum ProductStatus {
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

@Table({
  tableName: 'products',
  timestamps: true,
  paranoid: true // Enable soft deletes
})
export class Product extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  userId!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  description!: string;

  @Column({
    type: DataType.ENUM(...Object.values(ProductStatus)),
    allowNull: false,
    defaultValue: ProductStatus.SUBMITTED
  })
  status!: ProductStatus;

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

  @Column({
    type: DataType.DATE,
    field: 'deletedAt'
  })
  @DeletedAt
  deletedAt?: Date;

  // Associations
  @BelongsTo(() => User, {
    foreignKey: 'userId',
    as: 'user'
  })
  user!: User;

  @HasMany(() => Variant, {
    foreignKey: 'productId',
    as: 'variants',
    onDelete: 'CASCADE'
  })
  variants!: Variant[];
}
