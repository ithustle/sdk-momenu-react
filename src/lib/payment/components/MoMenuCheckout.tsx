import React, { useState } from 'react';
import { MCXPaymentForm } from './MCXPaymentForm';
import { EkwanzaPaymentForm } from './EkwanzaPaymentForm';
import { ReferencePaymentDisplay } from './ReferencePaymentDisplay';
import './Payments.css';

import type { PaymentMethod } from './MCXPaymentForm';
import type { SimulateResult } from '../types';

interface MoMenuCheckoutProps {
  amount: number;
  initialMethod?: PaymentMethod;
  /** QA only: simulate MCX payment outcome. Leave undefined in production. */
  simulateResult?: SimulateResult;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const MoMenuCheckout: React.FC<MoMenuCheckoutProps> = ({
  amount,
  initialMethod = 'mcx',
  simulateResult,
  onSuccess,
  onError,
}) => {
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);

  const methods = [
    { id: 'mcx', name: 'MCX', icon: '💳', label: 'Express' },
    { id: 'ekwanza', name: 'E-kwanza', icon: '📱', label: 'E-kwanza' },
    { id: 'reference', name: 'Referência', icon: '🏦', label: 'ATM' },
  ] as const;

  return (
    <div className="momenu-pay-form" style={{ maxWidth: '450px' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', textAlign: 'center' }}>Finalizar Pagamento</h2>
      
      <div className="momenu-pay-methods">
        {methods.map((m) => (
          <div
            key={m.id}
            className={`momenu-pay-method-item ${method === m.id ? 'active' : ''}`}
            onClick={() => setMethod(m.id)}
          >
            <span className="momenu-pay-method-icon">{m.icon}</span>
            <span className="momenu-pay-method-name">{m.label}</span>
          </div>
        ))}
      </div>

      <div style={{ minHeight: '300px' }}>
        {method === 'mcx' && (
          <MCXPaymentForm
            amount={amount}
            simulateResult={simulateResult}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
        {method === 'ekwanza' && (
          <EkwanzaPaymentForm amount={amount} onSuccess={onSuccess} onError={onError} />
        )}
        {method === 'reference' && (
          <ReferencePaymentDisplay amount={amount} onSuccess={onSuccess} onError={onError} />
        )}
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--momenu-pay-text-muted)' }}>
        Seguro e Processado por MoMenu © {new Date().getFullYear()}
      </div>
    </div>
  );
};
