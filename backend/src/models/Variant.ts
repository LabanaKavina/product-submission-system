import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Product } from './Product';

@Table({
  tableName: 'variants',
  timestamps: true
})
export class Variant extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  productId!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  })
  price!: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: false
  })
  imagePath!: string;

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
  @BelongsTo(() => Product, {
    foreignKey: 'productId',
    as: 'product'
  })
  product!: Product;
}
