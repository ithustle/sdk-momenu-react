import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../format';
describe('Format Utils', () => {
    describe('formatCurrency', () => {
        it('should format numbers to Kwanza currency string', () => {
            const result = formatCurrency(2500).replace(/\s/g, ' ');
            expect(result).toMatch(/2[.\s]500,00 Kz/);
            expect(formatCurrency(0).replace(/\s/g, ' ')).toBe('0,00 Kz');
        });
        it('should handle large numbers', () => {
            const result = formatCurrency(1000000).replace(/\s/g, ' ');
            expect(result).toMatch(/1[.\s]000[.\s]000,00 Kz/);
        });
    });
    describe('formatDate', () => {
        it('should format ISO dates to DD/MM/YYYY HH:mm', () => {
            const isoDate = '2024-03-20T10:30:00Z';
            expect(formatDate(isoDate)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        });
    });
});
