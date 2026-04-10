import React from 'react';
import './Payments.css';
import type { SimulateResult } from '../types';
export type PaymentMethod = 'mcx' | 'ekwanza' | 'reference';
interface MCXPaymentFormProps {
    amount: number;
    simulateResult?: SimulateResult;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}
export declare const MCXPaymentForm: React.FC<MCXPaymentFormProps>;
export {};
