import React from 'react';
import './Payments.css';
import type { PaymentProduct, PaymentCustomer, ReferenceStatusResponse } from '../types';
import type { MoMenuPaymentError } from '../utils/errors';
interface ReferencePaymentDisplayProps {
    amount: number;
    products: PaymentProduct[];
    customer?: PaymentCustomer;
    autoPoll?: boolean;
    onSuccess?: (data: ReferenceStatusResponse) => void;
    onError?: (error: MoMenuPaymentError) => void;
}
export declare const ReferencePaymentDisplay: React.FC<ReferencePaymentDisplayProps>;
export {};
