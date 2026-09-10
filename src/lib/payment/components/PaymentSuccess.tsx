import React from 'react';
import { formatCurrency, sanitizeUrl } from '../utils/format';
import { PaymentDetailRow } from './shared/PaymentDetailRow';
import './Payments.css';

interface PaymentSuccessProps {
  amount: number;
  transactionId?: string;
  invoiceUrl?: string;
  method?: string;
  onClose?: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = (props) => {
  const {
    amount,
    transactionId,
    invoiceUrl,
    onClose,
  } = props;

  const safeUrl = sanitizeUrl(invoiceUrl);

  return (
    <div className="momenu-pay-success-screen">
      <div className="momenu-pay-success-icon-wrapper">
        <div className="momenu-pay-success-icon" aria-hidden="true">✓</div>
      </div>

      <h2 className="momenu-pay-success-title">Pagamento Concluído!</h2>
      <p className="momenu-pay-success-message">
        Sua transação foi processada com sucesso. Obrigado por utilizar a MoMenu.
      </p>

      <div className="momenu-pay-success-details">
        <PaymentDetailRow
          label="Valor"
          value={<span className="momenu-pay-amount-highlight">{formatCurrency(amount)}</span>}
        />

        <div className="momenu-pay-divider" />

        {transactionId && (
          <PaymentDetailRow
            label="ID Transação"
            value={transactionId}
            isMonospace
          />
        )}
      </div>

      {safeUrl && (
        <a
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="momenu-pay-invoice-card"
        >
          <div className="momenu-pay-invoice-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="momenu-pay-invoice-content">
            <span className="momenu-pay-invoice-title">Descarregar Factura</span>
            <span className="momenu-pay-invoice-description">Documento certificado (PDF)</span>
          </div>
          <div className="momenu-pay-invoice-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </a>
      )}

      <div className="momenu-pay-success-actions">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
          }}
          className="momenu-pay-button momenu-pay-button-success"
        >
          Voltar ao site
        </button>
      </div>
    </div>
  );
};
