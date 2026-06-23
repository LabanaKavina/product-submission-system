import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

type UserRole = 'User' | 'Admin';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  };
}
