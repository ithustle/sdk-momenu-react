import type { EkwanzaPaymentRequest, EkwanzaPaymentResponse, EkwanzaStatusResponse } from '../types';
export declare function useEkwanzaPayment(): {
    pay: (request: EkwanzaPaymentRequest) => Promise<EkwanzaPaymentResponse>;
    loading: boolean;
    data: EkwanzaPaymentResponse | null;
    error: any;
    paymentStatus: EkwanzaStatusResponse | null;
    isPolling: boolean;
    stopPolling: () => void;
    reset: () => void;
};
