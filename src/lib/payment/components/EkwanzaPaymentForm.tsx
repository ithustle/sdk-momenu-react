import React, { useState, useEffect } from 'react';
import { useEkwanzaPayment } from '../hooks/useEkwanzaPayment';
import { formatCurrency } from '../utils/format';
import { validatePhone } from '../utils/validation';
import './Payments.css';

interface EkwanzaPaymentFormProps {
  amount: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const EkwanzaPaymentForm: React.FC<EkwanzaPaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { pay, loading, checkingStatus, data, error, paymentStatus, checkStatus } = useEkwanzaPayment();

  useEffect(() => {
    if (data?.paymentTimeout) {
      setTimeLeft(data.paymentTimeout);
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [data]);

  useEffect(() => {
    if (paymentStatus?.status === 'paid') {
      onSuccess?.(paymentStatus);
    }
  }, [paymentStatus, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    if (phoneNumber.length !== 9) {
      setPhoneError('O número deve ter exatamente 9 dígitos.');
      return;
    }
    const fullPhone = `244${phoneNumber}`;
    if (!validatePhone(fullPhone)) {
      setPhoneError('Número inválido. Insira os 9 dígitos após o 244.');
      return;
    }

    try {
      const fullPhone = `244${phoneNumber}`;
      await pay({
        paymentInfo: { amount, phoneNumber: fullPhone },
      });
    } catch (err) {
      onError?.(err);
    }
  };

  const handleCheckStatus = async () => {
    try {
      await checkStatus();
    } catch (err) {
      onError?.(err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="momenu-pay-form">
      <h3 style={{ margin: '0 0 8px 0' }}>E-kwanza</h3>
      
      <label className="momenu-pay-label">
        Valor a Pagar
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--momenu-pay-text)' }}>
          {formatCurrency(amount)}
        </div>
      </label>

      {!data && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
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
                disabled={loading}
                required
              />
            </div>
            {phoneError && (
              <div className="momenu-pay-status momenu-pay-status-error" style={{ marginTop: '4px' }}>
                <span>⚠️ {phoneError}</span>
              </div>
            )}
          </label>

          <button type="submit" className="momenu-pay-button" disabled={loading || !phoneNumber}>
            {loading ? <div className="momenu-pay-spinner" /> : 'Gerar QR Code'}
          </button>
        </form>
      )}

      {data?.qrCode && paymentStatus?.status !== 'paid' && (
        <div style={{ textAlign: 'center' }}>
          <div className="momenu-pay-qr-container">
            <img src={data.qrCode} alt="E-kwanza QR Code" className="momenu-pay-qr-image" />
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--momenu-pay-text-muted)' }}>
            Escaneie o código no seu app E-kwanza
          </p>
          <div style={{ 
            marginTop: '12px', 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            color: timeLeft < 30 ? 'var(--momenu-pay-error)' : 'var(--momenu-pay-primary)' 
          }}>
            {formatTime(timeLeft)}
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

      {paymentStatus?.status === 'paid' && (
        <div className="momenu-pay-status momenu-pay-status-success">
          <span>✅ Pagamento Recebido!</span>
          {paymentStatus.invoiceUrl && (
            <a href={paymentStatus.invoiceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', marginLeft: 'auto', textDecoration: 'underline' }}>
              Ver Fatura
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="momenu-pay-status momenu-pay-status-error">
          <span>❌ {error.message || 'Erro ao processar'}</span>
        </div>
      )}
    </div>
  );
};
