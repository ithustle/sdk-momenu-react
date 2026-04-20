import React, { useState, useEffect } from 'react';
import { MCXPaymentForm } from './MCXPaymentForm';

import { ReferencePaymentDisplay } from './ReferencePaymentDisplay';
import { PaymentSuccess } from './PaymentSuccess';
import { formatCurrency } from '../utils/format';
import './Payments.css';

export type PaymentMethod = 'mcx' | 'reference';
import type { SimulateResult, PaymentProduct, PaymentCustomer } from '../types';

interface MoMenuCheckoutProps {
  amount: number;
  products?: PaymentProduct[];
  customer?: PaymentCustomer;
  initialMethod?: PaymentMethod;
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  simulateResult?: SimulateResult;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const MoMenuCheckout: React.FC<MoMenuCheckoutProps> = ({
  amount,
  products,
  customer,
  initialMethod = 'mcx',
  isModal = true,
  isOpen = true,
  onClose,
  simulateResult,
  onSuccess,
  onError,
}) => {
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setSuccessData(null);
    }
  }, [isOpen]);

  const methods = [
    { id: 'mcx', name: 'MCX', icon: '💳', label: 'Express' },
    { id: 'reference', name: 'Referência', icon: '🏦', label: 'ATM' },
  ] as const;

  const handleSuccess = (data: any) => {
    setSuccessData(data);
    onSuccess?.(data);
  };

  const handleError = (error: any) => {
    onError?.(error);
  };

  const handleClose = () => {
    setSuccessData(null);
    onClose?.();
  };

  if (isModal && !isOpen) return null;

  const renderContent = () => {
    if (successData) {
      return (
        <PaymentSuccess
          amount={amount}
          transactionId={successData.transactionId || successData.operationId}
          invoiceUrl={successData.invoiceUrl}
          onClose={handleClose}
          method={method}
        />
      );
    }

    return (
      <div className="momenu-pay-form">
        <header className="momenu-pay-summary">
          <div className="momenu-pay-summary-info">
            <h2>Finalizar Pagamento</h2>
            <p>{products && products.length > 0 ? `${products.length} ${products.length === 1 ? 'item' : 'itens'}` : 'Pagamento Direto'}</p>
          </div>
          <div className="momenu-pay-summary-amount">
            <span className="momenu-pay-amount-label">Total a Pagar</span>
            <span className="momenu-pay-amount-value">{formatCurrency(amount)}</span>
          </div>
        </header>

        <div className="momenu-pay-form-content">
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
                products={products}
                customer={customer}
                simulateResult={simulateResult}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}

            {method === 'reference' && (
              <ReferencePaymentDisplay
                amount={amount}
                products={products}
                customer={customer}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--momenu-pay-success)', fontWeight: '600' }}>
              <span style={{ fontSize: '1rem' }}>🔒</span> Pagamento 100% Seguro
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--momenu-pay-text-muted)', opacity: 0.8 }}>
              Processado por MoMenu © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isModal) {
    return renderContent();
  }

  return (
    <div className="momenu-pay-modal-overlay">
      <div className="momenu-pay-modal-container">
        {!successData && onClose && (
          <button 
            type="button"
            className="momenu-pay-modal-close" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }} 
            aria-label="Fechar"
          >
            &times;
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );
};
