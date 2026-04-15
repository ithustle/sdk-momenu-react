import React, { useEffect, useRef } from 'react';
import { useReferencePayment } from '../hooks/useReferencePayment';
import { formatCurrency, formatDate } from '../utils/format';
import './Payments.css';

interface ReferencePaymentDisplayProps {
  amount: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const ReferencePaymentDisplay: React.FC<ReferencePaymentDisplayProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  const { pay, loading, checkingStatus, data, error, paymentStatus, checkStatus } = useReferencePayment();

  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  onErrorRef.current = onError;
  onSuccessRef.current = onSuccess;

  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    pay({ paymentInfo: { amount } }).catch(err => onErrorRef.current?.(err));
  }, [amount, pay]);

  useEffect(() => {
    if (paymentStatus?.payment.status === 'paid') {
      onSuccessRef.current?.(paymentStatus);
    }
  }, [paymentStatus]);

  const handleCheckStatus = async () => {
    try {
      await checkStatus();
    } catch (err) {
      onErrorRef.current?.(err);
    }
  };

  return (
    <div className="momenu-pay-form">
      <h3 style={{ margin: '0 0 8px 0' }}>Referência Bancária</h3>
      <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: 'var(--momenu-pay-text-muted)' }}>
        Efetue o pagamento via ATM (Multicaixa) ou Internet Banking usando os dados abaixo.
      </p>

      <label className="momenu-pay-label">
        Valor a Pagar
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--momenu-pay-text)' }}>
          {formatCurrency(amount)}
        </div>
      </label>

      {loading && !data && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px' }}>
          <div className="momenu-pay-spinner" style={{ width: '32px', height: '32px' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--momenu-pay-text-muted)' }}>A gerar referência...</span>
        </div>
      )}

      {data?.success && paymentStatus?.payment.status !== 'paid' && (
        <div className="momenu-pay-reference-card">
          <div className="momenu-pay-reference-row">
            <span className="momenu-pay-reference-label">Entidade</span>
            <span className="momenu-pay-reference-value">{data.entity}</span>
          </div>
          <div style={{ height: '1px', background: 'var(--momenu-pay-border)' }} />
          <div className="momenu-pay-reference-row">
            <span className="momenu-pay-reference-label">Referência</span>
            <span className="momenu-pay-reference-value" style={{ letterSpacing: '0.1em' }}>
              {data.referenceNumber}
            </span>
          </div>
          <div style={{ height: '1px', background: 'var(--momenu-pay-border)' }} />
          <div className="momenu-pay-reference-row">
            <span className="momenu-pay-reference-label">Data Limite</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{formatDate(data.dueDate)}</span>
          </div>

          <button 
            onClick={handleCheckStatus}
            className="momenu-pay-button"
            disabled={checkingStatus}
            style={{ marginTop: '16px', width: '100%' }}
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
        <div className="momenu-pay-status momenu-pay-status-success">
          <span>✅ Pagamento Confirmado!</span>
          {paymentStatus.invoiceUrl && (
            <a href={paymentStatus.invoiceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', marginLeft: 'auto', textDecoration: 'underline' }}>
              Ver Fatura
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="momenu-pay-status momenu-pay-status-error">
          <span>❌ {error.message || 'Erro ao gerar referência'}</span>
        </div>
      )}
    </div>
  );
};
