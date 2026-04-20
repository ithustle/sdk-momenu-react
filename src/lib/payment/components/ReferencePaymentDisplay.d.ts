import React from 'react';
import './Payments.css';
import type { PaymentProduct, PaymentCustomer } from '../types';
interface ReferencePaymentDisplayProps {
    amount: number;
    products?: PaymentProduct[];
    customer?: PaymentCustomer;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}
export declare const ReferencePaymentDisplay: React.FC<ReferencePaymentDisplayProps>;
export {};
