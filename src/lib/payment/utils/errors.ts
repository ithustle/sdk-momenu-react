import type { PollingError } from '../types';

/**
 * Error recoverability classification for retry strategy determination.
 * 
 * @internal
 */
export const ErrorRecoverability = {
  /**
   * Recoverable errors - temporary issues that may resolve with retry.
   * Examples: network timeouts, 5xx server errors, rate limiting
   */
  RECOVERABLE: 'RECOVERABLE',

  /**
   * Non-recoverable errors - permanent issues that won't resolve with retry.
   * Examples: 401 Unauthorized, 403 Forbidden, 404 Not Found, 400 Bad Request
   */
  NON_RECOVERABLE: 'NON_RECOVERABLE',

  /**
   * Limit reached errors - configured limits have been exceeded.
   * Examples: total timeout exceeded, max attempts reached
   */
  LIMIT_REACHED: 'LIMIT_REACHED',
} as const;

export type ErrorRecoverability = typeof ErrorRecoverability[keyof typeof ErrorRecoverability];

/**
 * Network error codes that indicate recoverable connection issues.
 * @internal
 */
const NETWORK_ERROR_CODES = [
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ENETUNREACH',
  'ECONNRESET',
  'EPIPE',
  'EAI_AGAIN',
];

/**
 * Classifies an error to determine the appropriate retry strategy.
 * 
 * This function categorizes errors into three types:
 * - RECOVERABLE: Temporary errors that may resolve with retry (network issues, 5xx errors)
 * - NON_RECOVERABLE: Permanent errors that won't resolve with retry (4xx errors)
 * - LIMIT_REACHED: Configured limits have been exceeded (timeout, max attempts)
 * 
 * @param error - The error to classify
 * @param context - Additional context about the error
 * @param context.isTimeout - Whether this is a timeout error
 * @param context.isMaxAttempts - Whether max attempts have been reached
 * @returns The error recoverability classification
 * 
 * @example
 * // Network error - should retry
 * const error = new Error('ECONNREFUSED');
 * classifyError(error, {}) // → RECOVERABLE
 * 
 * @example
 * // 404 error - should not retry
 * const error = { statusCode: 404, message: 'Not found' };
 * classifyError(error, {}) // → NON_RECOVERABLE
 * 
 * @example
 * // Timeout - limit reached
 * classifyError(new Error('Timeout'), { isTimeout: true }) // → LIMIT_REACHED
 */
export function classifyError(
  error: any,
  context: {
    isTimeout?: boolean;
    isMaxAttempts?: boolean;
  } = {}
): ErrorRecoverability {
  // Check if this is a limit-based error
  if (context.isTimeout || context.isMaxAttempts) {
    return ErrorRecoverability.LIMIT_REACHED;
  }

  // Check for network errors by error code
  if (error.code && NETWORK_ERROR_CODES.includes(error.code)) {
    return ErrorRecoverability.RECOVERABLE;
  }

  // Check for network errors by message (fallback)
  const errorMessage = error.message?.toLowerCase() || '';
  const isNetworkError = NETWORK_ERROR_CODES.some(code => 
    errorMessage.includes(code.toLowerCase())
  );
  if (isNetworkError) {
    return ErrorRecoverability.RECOVERABLE;
  }

  // Check for HTTP status code
  const statusCode = error.statusCode || error.status;
  if (statusCode) {
    // 4xx errors are client errors - non-recoverable
    if (statusCode >= 400 && statusCode < 500) {
      return ErrorRecoverability.NON_RECOVERABLE;
    }

    // 5xx errors are server errors - recoverable
    if (statusCode >= 500 && statusCode < 600) {
      return ErrorRecoverability.RECOVERABLE;
    }
  }

  // Default to recoverable for unknown errors (conservative approach)
  return ErrorRecoverability.RECOVERABLE;
}

/**
 * Creates a standardized PollingError object with complete context.
 * 
 * This function constructs a properly formatted error object that includes
 * all relevant information about a polling failure, making it easier to
 * debug issues and provide meaningful feedback to users.
 * 
 * @param params - Parameters for creating the error
 * @param params.type - The type/category of error
 * @param params.message - Human-readable error message
 * @param params.statusCode - HTTP status code (if applicable)
 * @param params.attempts - Number of attempts made before failure
 * @param params.elapsedTime - Total time elapsed in milliseconds
 * @param params.data - Additional error data from API response
 * @param params.originalError - The original error that caused the failure
 * @returns A complete PollingError object
 * 
 * @example
 * // Create a timeout error
 * const error = createPollingError({
 *   type: 'timeout',
 *   message: 'Polling timeout exceeded',
 *   attempts: 15,
 *   elapsedTime: 300000
 * });
 * 
 * @example
 * // Create a client error with HTTP status
 * const error = createPollingError({
 *   type: 'client_error',
 *   message: 'Payment not found',
 *   statusCode: 404,
 *   attempts: 3,
 *   elapsedTime: 15000,
 *   originalError: new Error('Not found')
 * });
 */
export function createPollingError(params: {
  type: PollingError['type'];
  message: string;
  statusCode?: number;
  attempts: number;
  elapsedTime: number;
  data?: any;
  originalError?: Error;
}): PollingError {
  const error = new Error(params.message) as PollingError;
  
  error.name = 'PollingError';
  error.type = params.type;
  error.attempts = params.attempts;
  error.elapsedTime = params.elapsedTime;

  if (params.statusCode !== undefined) {
    error.statusCode = params.statusCode;
  }

  if (params.data !== undefined) {
    error.data = params.data;
  }

  if (params.originalError !== undefined) {
    error.originalError = params.originalError;
  }

  return error;
}
