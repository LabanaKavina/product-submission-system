import Joi from 'joi';

const variantSchema = Joi.object({
  name: Joi.string().max(255).required(),
  price: Joi.number().positive().precision(2).required()
});

const updateVariantSchema = Joi.object({
  name: Joi.string().max(255).required(),
  price: Joi.number().positive().precision(2).required(),
  existingImagePath: Joi.string().optional()
});

export const createProductSchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().max(2000).required(),
  variants: Joi.array().min(1).items(variantSchema).required()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().max(2000).required(),
  variants: Joi.array().min(1).items(updateVariantSchema).required()
});
