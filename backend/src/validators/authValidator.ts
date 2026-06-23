import Joi from 'joi';

/**
 * Joi validation schema for the login endpoint.
 * Requires a valid email string and a non-empty password string.
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});
