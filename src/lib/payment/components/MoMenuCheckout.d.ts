import React from 'react';
import './Payments.css';
import type { PaymentMethod } from './MCXPaymentForm';
import type { SimulateResult } from '../types';
interface MoMenuCheckoutProps {
    amount: number;
    initialMethod?: PaymentMethod;
    /** Whether to render as a modal. Default is true based on user requirement. */
    isModal?: boolean;
    /** Controlled open state for modal mode. */
    isOpen?: boolean;
    /** Callback for when the modal wants to close. */
    onClose?: () => void;
    /** QA only: simulate MCX payment outcome. Leave undefined in production. */
    simulateResult?: SimulateResult;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}
export declare const MoMenuCheckout: React.FC<MoMenuCheckoutProps>;
export {};
