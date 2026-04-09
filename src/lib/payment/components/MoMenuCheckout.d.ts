import React from 'react';
import './Payments.css';
import type { PaymentMethod } from './MCXPaymentForm';
import type { SimulateResult } from '../types';
interface MoMenuCheckoutProps {
    amount: number;
    initialMethod?: PaymentMethod;
    /** QA only: simulate MCX payment outcome. Leave undefined in production. */
    simulateResult?: SimulateResult;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}
export declare const MoMenuCheckout: React.FC<MoMenuCheckoutProps>;
export {};
