import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef } from 'react';
import { useReferencePayment } from '../hooks/useReferencePayment';
import { formatCurrency, formatDate } from '../utils/format';
import './Payments.css';
export const ReferencePaymentDisplay = ({ amount, onSuccess, onError, }) => {
    const { pay, loading, data, error, paymentStatus, isPolling } = useReferencePayment();
    // Stable refs for callbacks — prevents useEffect from re-running when
    // the parent re-renders and passes new inline function references
    const onErrorRef = useRef(onError);
    const onSuccessRef = useRef(onSuccess);
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
    // Generate reference once on mount (or when amount changes)
    const hasFetched = useRef(false);
    useEffect(() => {
        if (hasFetched.current)
            return;
        hasFetched.current = true;
        pay({ paymentInfo: { amount } }).catch(err => onErrorRef.current?.(err));
    }, [amount, pay]);
    useEffect(() => {
        if (paymentStatus?.payment.status === 'paid') {
            onSuccessRef.current?.(paymentStatus);
        }
    }, [paymentStatus]);
    return (_jsxs("div", { className: "momenu-pay-form", children: [_jsx("h3", { style: { margin: '0 0 8px 0' }, children: "Refer\u00EAncia Banc\u00E1ria" }), _jsx("p", { style: { margin: '0 0 20px 0', fontSize: '0.875rem', color: 'var(--momenu-pay-text-muted)' }, children: "Efetue o pagamento via ATM (Multicaixa) ou Internet Banking usando os dados abaixo." }), _jsxs("label", { className: "momenu-pay-label", children: ["Valor a Pagar", _jsx("div", { style: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--momenu-pay-text)' }, children: formatCurrency(amount) })] }), loading && !data && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px' }, children: [_jsx("div", { className: "momenu-pay-spinner", style: { width: '32px', height: '32px' } }), _jsx("span", { style: { fontSize: '0.875rem', color: 'var(--momenu-pay-text-muted)' }, children: "A gerar refer\u00EAncia..." })] })), data?.success && paymentStatus?.payment.status !== 'paid' && (_jsxs("div", { className: "momenu-pay-reference-card", children: [_jsxs("div", { className: "momenu-pay-reference-row", children: [_jsx("span", { className: "momenu-pay-reference-label", children: "Entidade" }), _jsx("span", { className: "momenu-pay-reference-value", children: data.entity })] }), _jsx("div", { style: { height: '1px', background: 'var(--momenu-pay-border)' } }), _jsxs("div", { className: "momenu-pay-reference-row", children: [_jsx("span", { className: "momenu-pay-reference-label", children: "Refer\u00EAncia" }), _jsx("span", { className: "momenu-pay-reference-value", style: { letterSpacing: '0.1em' }, children: data.referenceNumber })] }), _jsx("div", { style: { height: '1px', background: 'var(--momenu-pay-border)' } }), _jsxs("div", { className: "momenu-pay-reference-row", children: [_jsx("span", { className: "momenu-pay-reference-label", children: "Data Limite" }), _jsx("span", { style: { fontSize: '0.875rem', fontWeight: '600' }, children: formatDate(data.dueDate) })] }), isPolling && (_jsxs("div", { style: { marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--momenu-pay-text)' }, children: [_jsx("div", { className: "momenu-pay-spinner", style: { width: '12px', height: '12px' } }), "A aguardar pagamento..."] }))] })), paymentStatus?.payment.status === 'paid' && (_jsxs("div", { className: "momenu-pay-status momenu-pay-status-success", children: [_jsx("span", { children: "\u2705 Pagamento Confirmado!" }), paymentStatus.invoiceUrl && (_jsx("a", { href: paymentStatus.invoiceUrl, target: "_blank", rel: "noopener noreferrer", style: { color: 'inherit', marginLeft: 'auto', textDecoration: 'underline' }, children: "Ver Fatura" }))] })), error && (_jsx("div", { className: "momenu-pay-status momenu-pay-status-error", children: _jsxs("span", { children: ["\u274C ", error.message || 'Erro ao gerar referência'] }) }))] }));
};
