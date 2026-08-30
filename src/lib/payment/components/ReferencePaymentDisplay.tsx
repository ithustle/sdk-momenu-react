import React, { useState, useEffect, useRef } from 'react';
import { useReferencePayment } from '../hooks/useReferencePayment';
import { CustomerDetailsForm } from './shared/CustomerDetailsForm';
import { StatusBanner } from './shared/StatusBanner';
import { formatDate, sanitizeUrl } from '../utils/format';
import './Payments.css';

import type { PaymentProduct, PaymentCustomer, ReferencePaymentRequest, ReferenceStatusResponse } from '../types';
import type { MoMenuPaymentError } from '../utils/errors';

interface ReferencePaymentDisplayProps {
  amount: number;
  products: PaymentProduct[];
  customer?: PaymentCustomer;
  autoPoll?: boolean;
  onSuccess?: (data: ReferenceStatusResponse) => void;
  onError?: (error: MoMenuPaymentError) => void;
}

export const ReferencePaymentDisplay: React.FC<ReferencePaymentDisplayProps> = ({
  amount,
  products,
  customer,
  autoPoll = false,
  onSuccess,
  onError,
}) => {
  const { pay, loading, checkingStatus, data, error, paymentStatus, checkStatus } = useReferencePayment({ autoPoll });
  const [showCustomer, setShowCustomer] = useState(!!customer);
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [customerNif, setCustomerNif] = useState(customer?.nif || '');
  const [customerError, setCustomerError] = useState('');

  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  onErrorRef.current = onError;
  onSuccessRef.current = onSuccess;

  const handleGenerate = async () => {
    setCustomerError('');

    if ((customerName && !customerNif) || (!customerName && customerNif)) {
      setCustomerError('Para factura personalizada, preencha Nome e NIF.');
      return;
    }

    try {
      const request: ReferencePaymentRequest = {
        paymentInfo: {
          amount: Number(amount)
        },
        products,
      };

      if (customerName.trim() && customerNif.trim()) {
        request.customer = {
          name: customerName.trim(),
          nif: customerNif.trim()
        };
      }

      await pay(request);
    } catch (err) {
      onErrorRef.current?.(err as MoMenuPaymentError);
    }
  };

  useEffect(() => {
    if (paymentStatus?.payment.status === 'paid') {
      onSuccessRef.current?.(paymentStatus);
    }
  }, [paymentStatus]);

  const handleCheckStatus = async () => {
    try {
      await checkStatus();
    } catch (err) {
      onErrorRef.current?.(err as MoMenuPaymentError);
    }
  };

  const safeInvoiceUrl = sanitizeUrl(paymentStatus?.invoiceUrl);

  return (
    <div className="momenu-pay-form-layout">
      <div>
        <h3 className="momenu-pay-title">Referência Bancária</h3>
        <p className="momenu-pay-text-description">
          Efetue o pagamento via ATM ou Internet Banking com os dados gerados abaixo.
        </p>
      </div>

      {!data && (
        <>
          <CustomerDetailsForm
            show={showCustomer}
            onToggle={(show) => {
              setShowCustomer(show);
              if (!show) {
                setCustomerName('');
                setCustomerNif('');
                setCustomerError('');
              }
            }}
            name={customerName}
            onNameChange={setCustomerName}
            nif={customerNif}
            onNifChange={setCustomerNif}
            disabled={loading}
            error={customerError}
          />

          <button
            onClick={handleGenerate}
            className="momenu-pay-button momenu-pay-button-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="momenu-pay-spinner" style={{ width: '18px', height: '18px' }} />
                A gerar...
              </>
            ) : 'Gerar Referência Bancária'}
          </button>
        </>
      )}

      {data?.success && paymentStatus?.payment.status !== 'paid' && (
        <div className="momenu-pay-reference-card">
          <div className="momenu-pay-reference-row">
            <span className="momenu-pay-reference-label">Entidade</span>
            <span className="momenu-pay-reference-value">{data.entity}</span>
          </div>

          <div className="momenu-pay-reference-divider" />

          <div className="momenu-pay-reference-row">
            <span className="momenu-pay-reference-label">Referência</span>
            <span className="momenu-pay-reference-value" style={{ letterSpacing: '0.15em' }}>
              {data.referenceNumber}
            </span>
          </div>

          <div className="momenu-pay-reference-divider" />

          <div className="momenu-pay-reference-row">
            <span className="momenu-pay-reference-label">Data Limite</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{formatDate(data.dueDate)}</span>
          </div>

          {autoPoll && (
            <p style={{ fontSize: '0.75rem', color: 'var(--momenu-pay-text-muted)', textAlign: 'center', margin: 0 }}>
              A verificar pagamento automaticamente...
            </p>
          )}

          <button
            onClick={handleCheckStatus}
            className="momenu-pay-button momenu-pay-button-full"
            disabled={checkingStatus}
            style={{ marginTop: '16px', borderRadius: '12px' }}
          >
            {checkingStatus ? (
              <>
                <div className="momenu-pay-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                A verificar...
              </>
            ) : (
              '✓ Já Paguei'
            )}
          </button>
        </div>
      )}

      {paymentStatus?.payment.status === 'paid' && (
        <StatusBanner
          type="success"
          message="Pagamento Confirmado!"
          action={
            safeInvoiceUrl && (
              <a
                href={safeInvoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="momenu-pay-status-link"
              >
                Ver Fatura
              </a>
            )
          }
        />
      )}

      {error && (
        <StatusBanner
          type="error"
          message={error.message || 'Erro ao gerar referência'}
        />
      )}
    </div>
  );
};
