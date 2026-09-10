import React, { useState, useEffect, useRef } from 'react';
import { MCXPaymentForm } from './MCXPaymentForm';
import { ReferencePaymentDisplay } from './ReferencePaymentDisplay';
import { PaymentSuccess } from './PaymentSuccess';
import { formatCurrency } from '../utils/format';
import './Payments.css';

import type { SimulateResult, PaymentProduct, PaymentCustomer, PaymentMethod, MCXPaymentResponse, ReferenceStatusResponse } from '../types';
import type { MoMenuPaymentError } from '../utils/errors';

type CheckoutSuccessData = MCXPaymentResponse | ReferenceStatusResponse;

interface MoMenuCheckoutProps {
  amount: number;
  products: PaymentProduct[];
  customer?: PaymentCustomer;
  initialMethod?: PaymentMethod;
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  simulateResult?: SimulateResult;
  autoPoll?: boolean;
  onSuccess?: (data: CheckoutSuccessData) => void;
  onError?: (error: MoMenuPaymentError) => void;
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
  autoPoll = false,
  onSuccess,
  onError,
}) => {
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [successData, setSuccessData] = useState<CheckoutSuccessData | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Escape key + focus management
  useEffect(() => {
    if (!isModal || !isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !successData) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus the modal container
    requestAnimationFrame(() => {
      modalRef.current?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isModal, isOpen, successData, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSuccessData(null);
    }
  }, [isOpen]);

  const methods = [
    { id: 'mcx' as const, name: 'MCX', icon: '💳', label: 'Express' },
    { id: 'reference' as const, name: 'Referência', icon: '🏦', label: 'ATM' },
  ];

  const handleSuccess = (data: CheckoutSuccessData) => {
    setSuccessData(data);
    onSuccess?.(data);
  };

  const handleError = (error: MoMenuPaymentError) => {
    onError?.(error);
  };

  const handleClose = () => {
    setSuccessData(null);
    onClose?.();
  };

  // Keyboard navigation for payment method radiogroup
  const handleMethodKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = methods.findIndex(m => m.id === method);
    let nextIndex: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % methods.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + methods.length) % methods.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = methods.length - 1;
        break;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      setMethod(methods[nextIndex].id);
    }
  };

  if (isModal && !isOpen) return null;

  const renderContent = () => {
    if (successData) {
      return (
        <PaymentSuccess
          amount={amount}
          transactionId={'transactionId' in successData ? (successData as MCXPaymentResponse).transactionId : undefined}
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
            <p>{products.length > 0 ? `${products.length} ${products.length === 1 ? 'item' : 'itens'}` : 'Pagamento Direto'}</p>
          </div>
          <div className="momenu-pay-summary-amount">
            <span className="momenu-pay-amount-label">Total a Pagar</span>
            <span className="momenu-pay-amount-value">{formatCurrency(amount)}</span>
          </div>
        </header>

        <div className="momenu-pay-form-content">
          <div className="momenu-pay-methods" role="radiogroup" aria-label="Método de pagamento" onKeyDown={handleMethodKeyDown}>
            {methods.map((m) => (
              <div
                key={m.id}
                role="radio"
                aria-checked={method === m.id}
                tabIndex={method === m.id ? 0 : -1}
                className={`momenu-pay-method-item ${method === m.id ? 'active' : ''}`}
                onClick={() => setMethod(m.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setMethod(m.id);
                  }
                }}
              >
                <span className="momenu-pay-method-icon" aria-hidden="true">{m.icon}</span>
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
                autoPoll={autoPoll}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--momenu-pay-success)', fontWeight: '600' }}>
              <span style={{ fontSize: '1rem' }} aria-hidden="true">🔒</span> Pagamento 100% Seguro
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
      <div
        className="momenu-pay-modal-container"
        role="dialog"
        aria-modal="true"
        aria-label="Pagamento MoMenu"
        tabIndex={-1}
        ref={modalRef}
      >
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
