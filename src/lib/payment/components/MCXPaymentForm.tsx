import React, { useState } from 'react';
import { useMCXPayment } from '../hooks/useMCXPayment';
import { formatCurrency } from '../utils/format';
import { validatePhoneNumber } from '../utils/validation';
import './Payments.css';

import type { SimulateResult } from '../types';

export type PaymentMethod = 'mcx' | 'ekwanza' | 'reference';

interface MCXPaymentFormProps {
  amount: number;
  simulateResult?: SimulateResult;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const MCXPaymentForm: React.FC<MCXPaymentFormProps> = ({
  amount,
  simulateResult,
  onSuccess,
  onError,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { pay, loading, data, error } = useMCXPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    if (phoneNumber.length !== 9) {
      setPhoneError('O número deve ter exatamente 9 dígitos.');
      return;
    }

    const fullPhone = `244${phoneNumber}`;
    const validation = validatePhoneNumber(fullPhone);
    if (!validation.isValid) {
      setPhoneError(validation.error || 'Número inválido.');
      return;
    }

    try {
      const fullPhone = `244${phoneNumber}`;
      const response = await pay({
        paymentInfo: {
          amount,
          phoneNumber: fullPhone,
        },
        ...(simulateResult ? { simulateResult } : {}),
      });
      
      if (response.success) {
        onSuccess?.(response);
      }
    } catch (err) {
      onError?.(err);
    }
  };

  return (
    <form className="momenu-pay-form" onSubmit={handleSubmit}>
      <h3 style={{ margin: '0 0 8px 0' }}>Multicaixa Express</h3>
      <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: 'var(--momenu-pay-text-muted)' }}>
        Insira o número de telefone associado à sua conta Multicaixa Express para confirmar o pagamento.
      </p>

      <label className="momenu-pay-label">
        Valor a Pagar
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--momenu-pay-text)' }}>
          {formatCurrency(amount)}
        </div>
      </label>

      <label className="momenu-pay-label">
        Número de Telefone
        <div className="momenu-pay-input-wrapper">
          <span className="momenu-pay-input-prefix">244</span>
          <input
            type="tel"
            className="momenu-pay-input-prefixed"
            placeholder="9XXXXXXXX"
            value={phoneNumber}
            onChange={(e) => { 
              const value = e.target.value.replace(/\D/g, '').slice(0, 9);
              setPhoneNumber(value); 
              setPhoneError(''); 
            }}
            disabled={loading || !!data}
            required
          />
        </div>
        {phoneError && (
          <div className="momenu-pay-status momenu-pay-status-error" style={{ marginTop: '4px' }}>
            <span>⚠️ {phoneError}</span>
          </div>
        )}
      </label>

      {!data && (
        <button 
          type="submit" 
          className="momenu-pay-button" 
          disabled={loading || !phoneNumber}
        >
          {loading ? <div className="momenu-pay-spinner" /> : 'Confirmar Pagamento'}
        </button>
      )}

      {data?.success && (
        <div className="momenu-pay-status momenu-pay-status-success">
          <span>✅ Pagamento Confirmado!</span>
          {data.invoiceUrl && (
            <a 
              href={data.invoiceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'inherit', marginLeft: 'auto', textDecoration: 'underline' }}
            >
              Ver Fatura
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="momenu-pay-status momenu-pay-status-error">
          <span>❌ {error.message || 'Erro ao processar pagamento'}</span>
        </div>
      )}
    </form>
  );
};
