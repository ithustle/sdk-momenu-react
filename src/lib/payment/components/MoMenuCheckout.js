import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { MCXPaymentForm } from './MCXPaymentForm';
import { EkwanzaPaymentForm } from './EkwanzaPaymentForm';
import { ReferencePaymentDisplay } from './ReferencePaymentDisplay';
import './Payments.css';
export const MoMenuCheckout = ({ amount, initialMethod = 'mcx', simulateResult, onSuccess, onError, }) => {
    const [method, setMethod] = useState(initialMethod);
    const methods = [
        { id: 'mcx', name: 'MCX', icon: '💳', label: 'Express' },
        { id: 'ekwanza', name: 'E-kwanza', icon: '📱', label: 'E-kwanza' },
        { id: 'reference', name: 'Referência', icon: '🏦', label: 'ATM' },
    ];
    return (_jsxs("div", { className: "momenu-pay-form", style: { maxWidth: '450px' }, children: [_jsx("h2", { style: { margin: '0 0 20px 0', fontSize: '1.25rem', textAlign: 'center' }, children: "Finalizar Pagamento" }), _jsx("div", { className: "momenu-pay-methods", children: methods.map((m) => (_jsxs("div", { className: `momenu-pay-method-item ${method === m.id ? 'active' : ''}`, onClick: () => setMethod(m.id), children: [_jsx("span", { className: "momenu-pay-method-icon", children: m.icon }), _jsx("span", { className: "momenu-pay-method-name", children: m.label })] }, m.id))) }), _jsxs("div", { style: { minHeight: '300px' }, children: [method === 'mcx' && (_jsx(MCXPaymentForm, { amount: amount, simulateResult: simulateResult, onSuccess: onSuccess, onError: onError })), method === 'ekwanza' && (_jsx(EkwanzaPaymentForm, { amount: amount, onSuccess: onSuccess, onError: onError })), method === 'reference' && (_jsx(ReferencePaymentDisplay, { amount: amount, onSuccess: onSuccess, onError: onError }))] }), _jsxs("div", { style: { marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--momenu-pay-text-muted)' }, children: ["Seguro e Processado por MoMenu \u00A9 ", new Date().getFullYear()] })] }));
};
