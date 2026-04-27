import React from 'react';
import './Payments.css';
export type PaymentMethod = 'mcx' | 'reference';
import type { SimulateResult, PaymentProduct, PaymentCustomer } from '../types';
interface MoMenuCheckoutProps {
    amount: number;
    products?: PaymentProduct[];
    customer?: PaymentCustomer;
    initialMethod?: PaymentMethod;
    isModal?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
    simulateResult?: SimulateResult;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}
export declare const MoMenuCheckout: React.FC<MoMenuCheckoutProps>;
export {};
