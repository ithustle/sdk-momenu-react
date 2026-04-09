import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useEkwanzaPayment } from '../hooks/useEkwanzaPayment';
import { formatCurrency } from '../utils/format';
import { validatePhone } from '../utils/validation';
import './Payments.css';
export const EkwanzaPaymentForm = ({ amount, onSuccess, onError, }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const { pay, loading, data, error, paymentStatus, isPolling } = useEkwanzaPayment();
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
    const handleSubmit = async (e) => {
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
        }
        catch (err) {
            onError?.(err);
        }
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    return (_jsxs("div", { className: "momenu-pay-form", children: [_jsx("h3", { style: { margin: '0 0 8px 0' }, children: "E-kwanza" }), _jsxs("label", { className: "momenu-pay-label", children: ["Valor a Pagar", _jsx("div", { style: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--momenu-pay-text)' }, children: formatCurrency(amount) })] }), !data && (_jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }, children: [_jsxs("label", { className: "momenu-pay-label", children: ["N\u00FAmero de Telefone", _jsxs("div", { className: "momenu-pay-input-wrapper", children: [_jsx("span", { className: "momenu-pay-input-prefix", children: "244" }), _jsx("input", { type: "tel", className: "momenu-pay-input-prefixed", placeholder: "9XXXXXXXX", value: phoneNumber, onChange: (e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                            setPhoneNumber(value);
                                            setPhoneError('');
                                        }, disabled: loading, required: true })] }), phoneError && (_jsx("div", { className: "momenu-pay-status momenu-pay-status-error", style: { marginTop: '4px' }, children: _jsxs("span", { children: ["\u26A0\uFE0F ", phoneError] }) }))] }), _jsx("button", { type: "submit", className: "momenu-pay-button", disabled: loading || !phoneNumber, children: loading ? _jsx("div", { className: "momenu-pay-spinner" }) : 'Gerar QR Code' })] })), data?.qrCode && paymentStatus?.status !== 'paid' && (_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { className: "momenu-pay-qr-container", children: _jsx("img", { src: data.qrCode, alt: "E-kwanza QR Code", className: "momenu-pay-qr-image" }) }), _jsx("p", { style: { fontSize: '0.875rem', fontWeight: '600', color: 'var(--momenu-pay-text-muted)' }, children: "Escaneie o c\u00F3digo no seu app E-kwanza" }), _jsx("div", { style: {
                            marginTop: '12px',
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: timeLeft < 30 ? 'var(--momenu-pay-error)' : 'var(--momenu-pay-primary)'
                        }, children: formatTime(timeLeft) }), isPolling && (_jsxs("div", { style: { marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--momenu-pay-text-muted)' }, children: [_jsx("div", { className: "momenu-pay-spinner", style: { width: '12px', height: '12px' } }), "A aguardar confirma\u00E7\u00E3o..."] }))] })), paymentStatus?.status === 'paid' && (_jsxs("div", { className: "momenu-pay-status momenu-pay-status-success", children: [_jsx("span", { children: "\u2705 Pagamento Recebido!" }), paymentStatus.invoiceUrl && (_jsx("a", { href: paymentStatus.invoiceUrl, target: "_blank", rel: "noopener noreferrer", style: { color: 'inherit', marginLeft: 'auto', textDecoration: 'underline' }, children: "Ver Fatura" }))] })), error && (_jsx("div", { className: "momenu-pay-status momenu-pay-status-error", children: _jsxs("span", { children: ["\u274C ", error.message || 'Erro ao processar'] }) }))] }));
};
