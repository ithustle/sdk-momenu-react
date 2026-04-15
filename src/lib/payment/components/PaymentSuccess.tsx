import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/format';
import './Payments.css';

interface PaymentSuccessProps {
  amount: number;
  transactionId?: string;
  invoiceUrl?: string;
  onClose?: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  amount,
  transactionId,
  invoiceUrl,
  onClose,
}) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-close after 5 seconds
    const closeTimer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(countdownInterval);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <div className="momenu-pay-success-screen">
      <div className="momenu-pay-success-icon-wrapper">
        <div className="momenu-pay-success-icon">✓</div>
      </div>

      <h2 className="momenu-pay-success-title">Pagamento Concluído!</h2>
      <p className="momenu-pay-success-message">
        Sua transação foi processada com sucesso. Obrigado por utilizar a MoMenu.
      </p>

      <div className="momenu-pay-success-details">
        <div className="momenu-pay-success-row">
          <span className="momenu-pay-success-label">Valor</span>
          <span className="momenu-pay-success-value">{formatCurrency(amount)}</span>
        </div>
        {transactionId && (
          <div className="momenu-pay-success-row">
            <span className="momenu-pay-success-label">ID Transação</span>
            <span className="momenu-pay-success-value" style={{ fontSize: '0.75rem' }}>
              {transactionId}
            </span>
          </div>
        )}
      </div>

      <div className="momenu-pay-success-actions">
        {invoiceUrl && (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="momenu-pay-button"
            style={{ textDecoration: 'none', width: 'auto' }}
          >
            📄 Ver Fatura
          </a>
        )}
        <p style={{ 
          textAlign: 'center', 
          color: 'var(--momenu-pay-text-secondary, #666)',
          fontSize: '0.875rem',
          margin: '1rem 0 0 0'
        }}>
          Fechando automaticamente em {countdown}s...
        </p>
      </div>
    </div>
  );
};
