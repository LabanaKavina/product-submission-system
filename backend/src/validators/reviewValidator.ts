import Joi from 'joi';

export const reviewSchema = Joi.object({
  status: Joi.string().valid('Approved', 'Rejected').required()
});
