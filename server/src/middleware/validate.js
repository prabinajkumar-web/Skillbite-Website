import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (e) {
    if (e instanceof ZodError) return next(new ApiError(400, e.errors.map(x => x.message).join(', ')));
    next(e);
  }
};