/**
 * Custom application error class for operational errors.
 * Operational errors are expected runtime errors (e.g., invalid input, unauthorized access)
 * as opposed to programmer errors (bugs). This distinction allows the error handler to
 * return meaningful messages to clients for operational errors while masking internal
 * details for unexpected errors.
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}
