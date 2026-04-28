import React, { useState } from 'react';
import { useMCXPayment } from '../hooks/useMCXPayment';
import { validatePhoneNumber } from '../utils/validation';
import { CustomerDetailsForm } from './shared/CustomerDetailsForm';
import { StatusBanner } from './shared/StatusBanner';
import './Payments.css';

import type { SimulateResult, PaymentProduct, PaymentCustomer, MCXPaymentRequest } from '../types';


interface MCXPaymentFormProps {
  amount: number;
  products?: PaymentProduct[];
  customer?: PaymentCustomer;
  simulateResult?: SimulateResult;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const MCXPaymentForm: React.FC<MCXPaymentFormProps> = ({
  amount,
  products,
  customer,
  simulateResult,
  onSuccess,
  onError,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showCustomer, setShowCustomer] = useState(!!customer);
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [customerNif, setCustomerNif] = useState(customer?.nif || '');
  const [customerError, setCustomerError] = useState('');

  const { pay, loading, data, error } = useMCXPayment();

  React.useEffect(() => {
    if (customer?.phone) {
      const cleanPhone = customer.phone.replace(/^244/, '').replace(/\s+/g, '');
      if (cleanPhone.length <= 9) {
        setPhoneNumber(cleanPhone);
      }
    }
  }, [customer?.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setCustomerError('');

    // Phone Validation
    if (phoneNumber.length !== 9) {
      setPhoneError('O número deve ter exatamente 9 dígitos.');
      return;
    }

    const fullPhone = `244${phoneNumber}`;
    const validation = validatePhoneNumber(fullPhone);
    if (!validation.isValid) {
      setPhoneError(validation.error || 'Número inválido.');
      return;
    }

    // Customer Validation (If one is provided, both are required)
    if ((customerName && !customerNif) || (!customerName && customerNif)) {
      setCustomerError('Para factura personalizada, preencha Nome e NIF.');
      return;
    }

    try {
      // Build request object with proper types
      const request: MCXPaymentRequest = {
        paymentInfo: {
          amount: Number(amount),
          phoneNumber: fullPhone,
        }
      };

      if (products && products.length > 0) {
        request.products = products;
      }

      if (customerName.trim() && customerNif.trim()) {
        request.customer = {
          name: customerName.trim(),
          nif: customerNif.trim()
        };
      }

      if (simulateResult) {
        request.simulateResult = simulateResult;
      }

      const response = await pay(request);

      if (response.success) {
        onSuccess?.(response);
      }
    } catch (err) {
      onError?.(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="momenu-pay-form-layout">
      <div>
        <h3 className="momenu-pay-title">Multicaixa Express</h3>
        <p className="momenu-pay-text-description">
          Insira o número de telefone associado à sua conta MCX para confirmar o pagamento.
        </p>
      </div>

      <label className="momenu-pay-label">
        Número de Telefone
        <div className="momenu-pay-input-wrapper">
          <span className="momenu-pay-input-prefix">244</span>
          <input
            type="tel"
            className="momenu-pay-input-prefixed"
            placeholder="9XXXXXXXX"
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 9);
              setPhoneNumber(value);
              setPhoneError('');
            }}
            disabled={loading || !!data}
            required
          />
        </div>
        {phoneError && (
          <StatusBanner type="error" message={phoneError} />
        )}
      </label>

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
        disabled={loading || !!data}
        error={customerError}
      />

      {!data && (
        <button
          type="submit"
          className="momenu-pay-button"
          disabled={loading || !phoneNumber}
        >
          {loading ? (
            <>
              <div className="momenu-pay-spinner" style={{ width: '18px', height: '18px' }} />
              A processar...
            </>
          ) : 'Confirmar Pagamento'}
        </button>
      )}

      {data?.success && (
        <StatusBanner 
          type="success" 
          message="Pagamento Confirmado!" 
          action={
            data.invoiceUrl && (
              <a
                href={data.invoiceUrl}
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
          message={error.message || 'Erro ao processar pagamento'} 
        />
      )}
    </form>
  );
};

