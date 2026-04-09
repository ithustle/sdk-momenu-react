import React from 'react';
import './Payments.css';
import type { SimulateResult } from '../types';
export type PaymentMethod = 'mcx' | 'ekwanza' | 'reference';
interface MCXPaymentFormProps {
    amount: number;
    /** QA only: simulate a specific payment outcome. Leave undefined in production. */
    simulateResult?: SimulateResult;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}
export declare const MCXPaymentForm: React.FC<MCXPaymentFormProps>;
export {};
