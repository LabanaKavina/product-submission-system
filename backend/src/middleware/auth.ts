import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

// JWT Payload interface
export interface JWTPayload {
  userId: number;
  role: 'User' | 'Admin';
  iat?: number;
  exp?: number;
}

// Extend Express Request type with user property
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware that verifies JWT tokens
 * Extracts the token from the Authorization header and validates it
 * Attaches the decoded user payload to req.user for use in subsequent middleware/controllers
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract authorization header
    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists and follows Bearer scheme
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please provide a valid token.'
      });
      return;
    }
    
    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);
    
    // Verify and decode the token
    const decoded = jwt.verify(token, jwtConfig.secret) as JWTPayload;
    
    // Attach decoded user information to request object
    req.user = decoded;
    
    // Proceed to next middleware
    next();
  } catch (error) {
    // Handle JWT-specific errors
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token. Please login again.'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'error',
        message: 'Token expired. Please login again.'
      });
      return;
    }
    
    // Handle other errors
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed. Please try again.'
    });
  }
}
