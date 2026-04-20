import React from 'react';

interface PaymentDetailRowProps {
  label: string;
  value: React.ReactNode;
  isMonospace?: boolean;
}

export const PaymentDetailRow: React.FC<PaymentDetailRowProps> = ({ label, value, isMonospace }) => {
  return (
    <div className="momenu-pay-success-row">
      <span className="momenu-pay-success-label">{label}</span>
      <span className={`momenu-pay-success-value ${isMonospace ? 'momenu-pay-value-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
};
