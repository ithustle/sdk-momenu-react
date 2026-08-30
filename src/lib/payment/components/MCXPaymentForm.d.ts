import React from 'react';
import './Payments.css';
import type { SimulateResult, PaymentProduct, PaymentCustomer, MCXPaymentResponse } from '../types';
import type { MoMenuPaymentError } from '../utils/errors';
interface MCXPaymentFormProps {
    amount: number;
    products: PaymentProduct[];
    customer?: PaymentCustomer;
    simulateResult?: SimulateResult;
    onSuccess?: (data: MCXPaymentResponse) => void;
    onError?: (error: MoMenuPaymentError) => void;
}
export declare const MCXPaymentForm: React.FC<MCXPaymentFormProps>;
export {};
