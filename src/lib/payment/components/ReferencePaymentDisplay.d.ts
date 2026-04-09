import React from 'react';
import './Payments.css';
interface ReferencePaymentDisplayProps {
    amount: number;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}
export declare const ReferencePaymentDisplay: React.FC<ReferencePaymentDisplayProps>;
export {};
