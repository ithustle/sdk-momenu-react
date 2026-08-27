import React from 'react';
import './Payments.css';
import type { SimulateResult, PaymentProduct, PaymentCustomer, PaymentMethod } from '../types';
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
