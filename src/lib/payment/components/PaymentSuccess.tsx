import React from 'react';
import { formatCurrency } from '../utils/format';
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

        {invoiceUrl && (
          <PaymentDetailRow 
            label="Factura" 
            value={
              <a 
                href={invoiceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="momenu-pay-link"
              >
                {invoiceUrl}
              </a>
            } 
          />
        )}
      </div>

      {invoiceUrl && (
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="momenu-pay-button momenu-pay-button-secondary"
        >
          <span>📄</span> Descarregar Factura (PDF)
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

