import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useMCXPayment } from '../hooks/useMCXPayment';
import { formatCurrency } from '../utils/format';
import { validatePhone } from '../utils/validation';
import './Payments.css';
export const MCXPaymentForm = ({ amount, simulateResult, onSuccess, onError, }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const { pay, loading, data, error } = useMCXPayment();
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
            const response = await pay({
                paymentInfo: {
                    amount,
                    phoneNumber: fullPhone,
                },
                ...(simulateResult ? { simulateResult } : {}),
            });
            if (response.success) {
                onSuccess?.(response);
            }
        }
        catch (err) {
            onError?.(err);
        }
    };
    return (_jsxs("form", { className: "momenu-pay-form", onSubmit: handleSubmit, children: [_jsx("h3", { style: { margin: '0 0 8px 0' }, children: "Multicaixa Express" }), _jsx("p", { style: { margin: '0 0 20px 0', fontSize: '0.875rem', color: 'var(--momenu-pay-text-muted)' }, children: "Insira o n\u00FAmero de telefone associado \u00E0 sua conta Multicaixa Express para confirmar o pagamento." }), _jsxs("label", { className: "momenu-pay-label", children: ["Valor a Pagar", _jsx("div", { style: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--momenu-pay-text)' }, children: formatCurrency(amount) })] }), _jsxs("label", { className: "momenu-pay-label", children: ["N\u00FAmero de Telefone", _jsxs("div", { className: "momenu-pay-input-wrapper", children: [_jsx("span", { className: "momenu-pay-input-prefix", children: "244" }), _jsx("input", { type: "tel", className: "momenu-pay-input-prefixed", placeholder: "9XXXXXXXX", value: phoneNumber, onChange: (e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                    setPhoneNumber(value);
                                    setPhoneError('');
                                }, disabled: loading || !!data, required: true })] }), phoneError && (_jsx("div", { className: "momenu-pay-status momenu-pay-status-error", style: { marginTop: '4px' }, children: _jsxs("span", { children: ["\u26A0\uFE0F ", phoneError] }) }))] }), !data && (_jsx("button", { type: "submit", className: "momenu-pay-button", disabled: loading || !phoneNumber, children: loading ? _jsx("div", { className: "momenu-pay-spinner" }) : 'Confirmar Pagamento' })), data?.success && (_jsxs("div", { className: "momenu-pay-status momenu-pay-status-success", children: [_jsx("span", { children: "\u2705 Pagamento Confirmado!" }), data.invoiceUrl && (_jsx("a", { href: data.invoiceUrl, target: "_blank", rel: "noopener noreferrer", style: { color: 'inherit', marginLeft: 'auto', textDecoration: 'underline' }, children: "Ver Fatura" }))] })), error && (_jsx("div", { className: "momenu-pay-status momenu-pay-status-error", children: _jsxs("span", { children: ["\u274C ", error.message || 'Erro ao processar pagamento'] }) }))] }));
};
