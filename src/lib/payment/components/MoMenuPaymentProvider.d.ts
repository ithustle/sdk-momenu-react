import React from 'react';
import type { PaymentConfig, PaymentTheme } from '../types';
interface MoMenuPaymentProviderProps {
    children: React.ReactNode;
    config: PaymentConfig;
    theme?: PaymentTheme;
}
export declare const MoMenuPaymentProvider: React.FC<MoMenuPaymentProviderProps>;
export {};
