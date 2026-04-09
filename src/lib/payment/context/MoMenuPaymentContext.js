import { createContext, useContext } from 'react';
import { MoMenuPaymentClient } from '../client/MoMenuPaymentClient';
export const MoMenuPaymentContext = createContext(null);
export function useMoMenuPaymentContext() {
    const context = useContext(MoMenuPaymentContext);
    if (!context) {
        throw new Error('useMoMenuPayment must be used within a MoMenuPaymentProvider');
    }
    return context;
}
