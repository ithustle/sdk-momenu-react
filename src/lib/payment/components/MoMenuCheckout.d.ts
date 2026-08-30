import React from 'react';
import './Payments.css';
import type { SimulateResult, PaymentProduct, PaymentCustomer, PaymentMethod, MCXPaymentResponse, ReferenceStatusResponse } from '../types';
import type { MoMenuPaymentError } from '../utils/errors';
type CheckoutSuccessData = MCXPaymentResponse | ReferenceStatusResponse;
interface MoMenuCheckoutProps {
    amount: number;
    products: PaymentProduct[];
    customer?: PaymentCustomer;
    initialMethod?: PaymentMethod;
    isModal?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
    simulateResult?: SimulateResult;
    autoPoll?: boolean;
    onSuccess?: (data: CheckoutSuccessData) => void;
    onError?: (error: MoMenuPaymentError) => void;
}
export declare const MoMenuCheckout: React.FC<MoMenuCheckoutProps>;
export {};
