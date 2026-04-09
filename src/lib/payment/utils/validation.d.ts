import type { PaymentProduct } from '../types';
/**
 * Validates that the amount matches the sum of product prices and quantities.
 */
export declare function validateAmount(amount: number, products?: PaymentProduct[]): {
    valid: boolean;
    error?: string;
};
/**
 * Validates the Angolan phone number format (244XXXXXXXXX).
 */
export declare function validatePhone(phone: string): boolean;
/**
 * Calculates the 2% processing fee.
 */
export declare function calculateFee(amount: number): number;
