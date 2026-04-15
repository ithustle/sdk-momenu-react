import type { PollingError } from '../types';
/**
 * Error recoverability classification for retry strategy determination.
 *
 * @internal
 */
export declare const ErrorRecoverability: {
    /**
     * Recoverable errors - temporary issues that may resolve with retry.
     * Examples: network timeouts, 5xx server errors, rate limiting
     */
    readonly RECOVERABLE: "RECOVERABLE";
    /**
     * Non-recoverable errors - permanent issues that won't resolve with retry.
     * Examples: 401 Unauthorized, 403 Forbidden, 404 Not Found, 400 Bad Request
     */
    readonly NON_RECOVERABLE: "NON_RECOVERABLE";
    /**
     * Limit reached errors - configured limits have been exceeded.
     * Examples: total timeout exceeded, max attempts reached
     */
    readonly LIMIT_REACHED: "LIMIT_REACHED";
};
export type ErrorRecoverability = typeof ErrorRecoverability[keyof typeof ErrorRecoverability];
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
export declare function classifyError(error: any, context?: {
    isTimeout?: boolean;
    isMaxAttempts?: boolean;
}): ErrorRecoverability;
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
export declare function createPollingError(params: {
    type: PollingError['type'];
    message: string;
    statusCode?: number;
    attempts: number;
    elapsedTime: number;
    data?: any;
    originalError?: Error;
}): PollingError;
