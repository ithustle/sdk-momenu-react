import type { ReferencePaymentRequest, ReferencePaymentResponse, ReferenceStatusResponse } from '../types';
export declare function useReferencePayment(): {
    pay: (request: ReferencePaymentRequest) => Promise<ReferencePaymentResponse>;
    loading: boolean;
    checkingStatus: boolean;
    data: ReferencePaymentResponse | null;
    error: any;
    paymentStatus: ReferenceStatusResponse | null;
    checkStatus: () => Promise<ReferenceStatusResponse>;
    reset: () => void;
};
