import { createContext, useContext } from 'react';
import { MoMenuPaymentClient } from '../client/MoMenuPaymentClient';

export interface MoMenuPaymentContextValue {
  client: MoMenuPaymentClient;
}

export const MoMenuPaymentContext = createContext<MoMenuPaymentContextValue | null>(null);

export function useMoMenuPaymentContext(): MoMenuPaymentContextValue {
  const context = useContext(MoMenuPaymentContext);
  if (!context) {
    throw new Error('useMoMenuPayment must be used within a MoMenuPaymentProvider');
  }
  return context;
}
