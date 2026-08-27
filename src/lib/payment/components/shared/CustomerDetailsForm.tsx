import React from 'react';

interface CustomerDetailsFormProps {
  show: boolean;
  onToggle: (show: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  nif: string;
  onNifChange: (nif: string) => void;
  disabled?: boolean;
  error?: string;
}

export const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({
  show,
  onToggle,
  name,
  onNameChange,
  nif,
  onNifChange,
  disabled,
  error,
}) => {
  return (
    <div className="momenu-pay-customer-section">
      <label className="momenu-pay-customer-checkbox-label">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => onToggle(e.target.checked)}
          disabled={disabled}
        />
        <span className="momenu-pay-checkbox-custom"></span>
        <span>Adicionar dados de facturação (opcional)</span>
      </label>

      {show && (
        <div className="momenu-pay-customer-fields">
          <div className="momenu-pay-customer-row">
            <label className="momenu-pay-label">
              Nome do Cliente
              <input
                type="text"
                className="momenu-pay-input"
                placeholder="ex: Higino Neto"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                disabled={disabled}
                autoComplete="off"
              />
            </label>
            <label className="momenu-pay-label">
              NIF
              <input
                type="text"
                className="momenu-pay-input"
                placeholder="ex: 500000000"
                value={nif}
                onChange={(e) => onNifChange(e.target.value)}
                disabled={disabled}
                autoComplete="off"
              />
            </label>
          </div>
          {error && (
            <div className="momenu-pay-status momenu-pay-status-error momenu-pay-customer-error">
              <span>⚠️ {error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
