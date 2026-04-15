import React, { useState, useEffect } from 'react';
import { MCXPaymentForm } from './MCXPaymentForm';
import { EkwanzaPaymentForm } from './EkwanzaPaymentForm';
import { ReferencePaymentDisplay } from './ReferencePaymentDisplay';
import { PaymentSuccess } from './PaymentSuccess';
import './Payments.css';

import type { PaymentMethod } from './MCXPaymentForm';
import type { SimulateResult } from '../types';

interface MoMenuCheckoutProps {
  amount: number;
  initialMethod?: PaymentMethod;
  /** Whether to render as a modal. Default is true based on user requirement. */
  isModal?: boolean;
  /** Controlled open state for modal mode. */
  isOpen?: boolean;
  /** Callback for when the modal wants to close. */
  onClose?: () => void;
  /** QA only: simulate MCX payment outcome. Leave undefined in production. */
  simulateResult?: SimulateResult;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const MoMenuCheckout: React.FC<MoMenuCheckoutProps> = ({
  amount,
  initialMethod = 'mcx',
  isModal = true, // Default to true as per request "O SDK precisa abrir como um modal"
  isOpen = true,
  onClose,
  simulateResult,
  onSuccess,
  onError,
}) => {
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [successData, setSuccessData] = useState<any>(null);

  // Reset success state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSuccessData(null);
    }
  }, [isOpen]);

  const methods = [
    { id: 'mcx', name: 'MCX', icon: '💳', label: 'Express' },
    { id: 'ekwanza', name: 'E-kwanza', icon: '📱', label: 'E-kwanza' },
    { id: 'reference', name: 'Referência', icon: '🏦', label: 'ATM' },
  ] as const;

  const handleSuccess = (data: any) => {
    console.log('[MoMenu SDK] Pagamento bem sucedido:', data);
    setSuccessData(data);
    onSuccess?.(data);
  };

  const handleError = (error: any) => {
    console.error('[MoMenu SDK] Erro no pagamento:', error);
    onError?.(error);
  };

  if (isModal && !isOpen) return null;

  const renderContent = () => {
    if (successData) {
      return (
        <PaymentSuccess
          amount={amount}
          transactionId={successData.transactionId || successData.merchantTransactionId || successData.operationId}
          invoiceUrl={successData.invoiceUrl}
          onClose={onClose}
        />
      );
    }

    return (
      <div className="momenu-pay-form">
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
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}
          {method === 'ekwanza' && (
            <EkwanzaPaymentForm amount={amount} onSuccess={handleSuccess} onError={handleError} />
          )}
          {method === 'reference' && (
            <ReferencePaymentDisplay amount={amount} onSuccess={handleSuccess} onError={handleError} />
          )}
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--momenu-pay-text-muted)' }}>
          Seguro e Processado por MoMenu © {new Date().getFullYear()}
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
          <button className="momenu-pay-modal-close" onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );
};
