import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

/**
 * AuthController handles HTTP-level concerns for authentication:
 * - Extracting inputs from the request
 * - Delegating business logic to AuthService
 * - Formatting and sending the response
 *
 * Errors are forwarded to Express's error-handling middleware via `next(error)`.
 */
class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/login
   * Validates credentials and returns a signed JWT along with basic user info.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };

      const userData = await this.authService.validateCredentials(email, password);
      const token = this.authService.generateToken(userData);

      res.status(200).json({
        token,
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
