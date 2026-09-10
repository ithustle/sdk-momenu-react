import type { PaymentErrorCode } from '../types';

/**
 * Structured error thrown by the MoMenu Payment SDK.
 *
 * Carries a `code` that consumers can switch on for programmatic error handling,
 * instead of parsing the error message string.
 */
export class MoMenuPaymentError extends Error {
  readonly code: PaymentErrorCode;
  readonly status?: number;

  constructor(message: string, code: PaymentErrorCode, status?: number) {
    super(message);
    this.name = 'MoMenuPaymentError';
    this.code = code;
    this.status = status;
  }
}
