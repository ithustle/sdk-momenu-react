import { describe, it, expect } from 'vitest';
import { validateAmount, validatePhoneNumber, validateProductsSum } from '../utils/validation';
import { sanitizeUrl, formatCurrency, formatDate } from '../utils/format';

// ─── validateAmount ───────────────────────────────────────────────────────────

describe('validateAmount', () => {
  it('aceita montante válido acima do mínimo', () => {
    expect(validateAmount(2500).isValid).toBe(true);
    expect(validateAmount(50).isValid).toBe(true);
  });

  it('rejeita montante zero', () => {
    const result = validateAmount(0);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejeita montante negativo', () => {
    const result = validateAmount(-100);
    expect(result.isValid).toBe(false);
  });

  it('rejeita montante abaixo do mínimo (50 Kz)', () => {
    const result = validateAmount(30);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('50');
  });

  it('rejeita NaN', () => {
    const result = validateAmount(NaN);
    expect(result.isValid).toBe(false);
  });
});

// ─── validatePhoneNumber ──────────────────────────────────────────────────────

describe('validatePhoneNumber', () => {
  it('aceita número válido começado por 9 (móvel)', () => {
    expect(validatePhoneNumber('244923456789').isValid).toBe(true);
  });

  it('aceita número válido começado por 2 (fixo)', () => {
    expect(validatePhoneNumber('244222456789').isValid).toBe(true);
  });

  it('rejeita número com vírgula no prefixo (bug do regex [9,2])', () => {
    const result = validatePhoneNumber('244,23456789');
    expect(result.isValid).toBe(false);
  });

  it('rejeita número vazio', () => {
    const result = validatePhoneNumber('');
    expect(result.isValid).toBe(false);
  });

  it('rejeita número curto demais', () => {
    const result = validatePhoneNumber('244923');
    expect(result.isValid).toBe(false);
  });

  it('rejeita número sem prefixo 244', () => {
    const result = validatePhoneNumber('923456789');
    expect(result.isValid).toBe(false);
  });
});

// ─── validateProductsSum ──────────────────────────────────────────────────────

describe('validateProductsSum', () => {
  it('valida quando a soma corresponde ao montante', () => {
    const products = [
      { productPrice: 1000, productQuantity: 2 },
      { productPrice: 500, productQuantity: 1 },
    ];
    expect(validateProductsSum(2500, products).isValid).toBe(true);
  });

  it('rejeita quando a soma não corresponde ao montante', () => {
    const products = [
      { productPrice: 1000, productQuantity: 2 },
    ];
    const result = validateProductsSum(3000, products);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('2000');
    expect(result.error).toContain('3000');
  });

  it('passa quando não há produtos', () => {
    expect(validateProductsSum(1000, []).isValid).toBe(true);
  });
});

// ─── sanitizeUrl ──────────────────────────────────────────────────────────────

describe('sanitizeUrl', () => {
  it('aceita URL https', () => {
    expect(sanitizeUrl('https://example.com/doc.pdf')).toBe('https://example.com/doc.pdf');
  });

  it('aceita URL http', () => {
    expect(sanitizeUrl('http://example.com/doc.pdf')).toBe('http://example.com/doc.pdf');
  });

  it('rejeita javascript: URL', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined();
  });

  it('rejeita data: URL', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('retorna undefined para URL vazia', () => {
    expect(sanitizeUrl(undefined)).toBeUndefined();
    expect(sanitizeUrl('')).toBeUndefined();
  });

  it('retorna undefined para URL inválida', () => {
    expect(sanitizeUrl('not-a-url')).toBeUndefined();
  });
});

// ─── formatCurrency / formatDate ───────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formata montante em Kwanzas', () => {
    const result = formatCurrency(2500);
    expect(result).toContain('Kz');
    expect(result).toMatch(/\d/);
  });
});

describe('formatDate', () => {
  it('formata data ISO', () => {
    const result = formatDate('2026-09-30T12:00:00Z');
    expect(result).toBeTruthy();
    expect(result).toContain('2026');
  });

  it('retorna string vazia para undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });
});
