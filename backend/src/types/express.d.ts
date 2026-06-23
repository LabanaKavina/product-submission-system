import { JWTPayload } from '../middleware/auth';

/**
 * Extend Express Request interface to include user property
 * This allows TypeScript to recognize req.user after authentication middleware
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// This export is required to make this file a module
export {};
