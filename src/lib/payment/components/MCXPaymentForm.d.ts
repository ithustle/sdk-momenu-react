import React from 'react';
import './Payments.css';
import type { SimulateResult, PaymentProduct, PaymentCustomer } from '../types';
export type PaymentMethod = 'mcx' | 'reference';
interface MCXPaymentFormProps {
    amount: number;
    products?: PaymentProduct[];
    customer?: PaymentCustomer;
    simulateResult?: SimulateResult;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}
export declare const MCXPaymentForm: React.FC<MCXPaymentFormProps>;
export {};
