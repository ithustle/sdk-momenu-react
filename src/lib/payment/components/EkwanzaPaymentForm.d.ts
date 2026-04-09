import React from 'react';
import './Payments.css';
interface EkwanzaPaymentFormProps {
    amount: number;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}
export declare const EkwanzaPaymentForm: React.FC<EkwanzaPaymentFormProps>;
export {};
