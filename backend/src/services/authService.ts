import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/errors';
import { JWTPayload } from '../middleware/auth';

/**
 * Represents the authenticated user data returned after credential validation.
 * Excludes sensitive fields like the hashed password.
 */
export interface UserData {
  id: number;
  email: string;
  role: 'User' | 'Admin';
}

/**
 * AuthService handles user authentication business logic:
 * - Validating email/password credentials against stored bcrypt hashes
 * - Generating signed JWT tokens for authenticated sessions
 */
export class AuthService {
  /**
   * Validates user credentials by looking up the user by email and comparing
   * the provided plaintext password against the stored bcrypt hash.
   *
   * @param email - The user's email address
   * @param password - The plaintext password to verify
   * @returns Resolved UserData (id, email, role) if credentials are valid
   * @throws AppError(401) if the user is not found or password does not match
   */
  async validateCredentials(email: string, password: string): Promise<UserData> {
    // Look up user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Use a generic message to avoid leaking whether the email exists
      throw new AppError('Invalid credentials', 401);
    }

    // Compare provided password with stored hash
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as 'User' | 'Admin'
    };
  }

  /**
   * Generates a signed JWT token for the given user.
   * The token payload includes the user's ID and role, which are used
   * by the auth middleware to authorize subsequent requests.
   *
   * @param user - The authenticated user's data
   * @returns A signed JWT string
   */
  generateToken(user: UserData): string {
    const payload: JWTPayload = {
      userId: user.id,
      role: user.role
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRATION || '24h') as jwt.SignOptions['expiresIn'] }
    );
  }
}
