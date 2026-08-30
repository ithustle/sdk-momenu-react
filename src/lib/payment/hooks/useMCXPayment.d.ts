import type { MCXPaymentRequest, MCXPaymentResponse } from '../types';
import type { MoMenuPaymentError } from '../utils/errors';
export declare function useMCXPayment(): {
    pay: (request: MCXPaymentRequest) => Promise<MCXPaymentResponse>;
    loading: boolean;
    data: MCXPaymentResponse | null;
    error: MoMenuPaymentError | null;
    reset: () => void;
};
