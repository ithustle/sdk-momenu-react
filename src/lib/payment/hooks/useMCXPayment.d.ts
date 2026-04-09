import type { MCXPaymentRequest, MCXPaymentResponse } from '../types';
export declare function useMCXPayment(): {
    pay: (request: MCXPaymentRequest) => Promise<MCXPaymentResponse>;
    loading: boolean;
    data: MCXPaymentResponse | null;
    error: any;
    reset: () => void;
};
