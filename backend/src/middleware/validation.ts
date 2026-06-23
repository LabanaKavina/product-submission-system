import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/errors';

function parseMultipartBody(body: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(body)) {
    const match = key.match(/^(\w+)\[(\d+)\]\[(\w+)\]$/);
    if (match) {
      const [, arrayKey, indexStr, fieldKey] = match;
      const index = parseInt(indexStr, 10);
      if (!result[arrayKey]) result[arrayKey] = [];
      const arr = result[arrayKey] as Record<string, unknown>[];
      if (!arr[index]) arr[index] = {};
      let value = body[key];
      if (fieldKey === 'price' && typeof value === 'string') {
        value = parseFloat(value);
      }
      arr[index][fieldKey] = value;
    } else {
      result[key] = body[key];
    }
  }

  return result;
}

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const bodyToParse = req.is('multipart/form-data')
      ? parseMultipartBody(req.body as Record<string, unknown>)
      : req.body;

    const { error, value } = schema.validate(bodyToParse, { abortEarly: false });

    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(new AppError(message, 400));
    }

    req.body = value;
    next();
  };
}
