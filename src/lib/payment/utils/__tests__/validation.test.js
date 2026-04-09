import { describe, it, expect } from 'vitest';
import { validatePhone, validateAmount } from '../validation';
describe('Validation Utils', () => {
    describe('validatePhone', () => {
        it('should validate correct Angolan phone numbers with 244 prefix', () => {
            expect(validatePhone('244923000000')).toBe(true);
            expect(validatePhone('244945000000')).toBe(true);
            expect(validatePhone('244912000000')).toBe(true);
        });
        it('should fail for numbers without 244 prefix', () => {
            expect(validatePhone('923000000')).toBe(false);
        });
        it('should fail for too short or too long numbers', () => {
            expect(validatePhone('244923000')).toBe(false);
            expect(validatePhone('24492300000000')).toBe(false);
        });
        it('should fail for non-numeric characters', () => {
            expect(validatePhone('244923abc000')).toBe(false);
        });
    });
    describe('validateAmount', () => {
        it('should validate positive amounts', () => {
            expect(validateAmount(100).valid).toBe(true);
            expect(validateAmount(1).valid).toBe(true);
        });
        it('should fail for zero or negative amounts with products', () => {
            const products = [{ id: '1', productName: 'P1', productPrice: 10, productQuantity: 1 }];
            expect(validateAmount(0, products).valid).toBe(false);
            expect(validateAmount(5, products).valid).toBe(false);
        });
    });
});
