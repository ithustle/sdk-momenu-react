import React from 'react';
import './Payments.css';
interface PaymentSuccessProps {
    amount: number;
    transactionId?: string;
    invoiceUrl?: string;
    onClose?: () => void;
}
export declare const PaymentSuccess: React.FC<PaymentSuccessProps>;
export {};
