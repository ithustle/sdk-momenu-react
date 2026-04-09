import type { ReferencePaymentRequest, ReferencePaymentResponse, ReferenceStatusResponse } from '../types';
export declare function useReferencePayment(): {
    pay: (request: ReferencePaymentRequest) => Promise<ReferencePaymentResponse>;
    loading: boolean;
    data: ReferencePaymentResponse | null;
    error: any;
    paymentStatus: ReferenceStatusResponse | null;
    isPolling: boolean;
    stopPolling: () => void;
    reset: () => void;
};
