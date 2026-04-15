import type { EkwanzaPaymentRequest, EkwanzaPaymentResponse, EkwanzaStatusResponse } from '../types';
export declare function useEkwanzaPayment(): {
    pay: (request: EkwanzaPaymentRequest) => Promise<EkwanzaPaymentResponse>;
    loading: boolean;
    checkingStatus: boolean;
    data: EkwanzaPaymentResponse | null;
    error: any;
    paymentStatus: EkwanzaStatusResponse | null;
    checkStatus: () => Promise<EkwanzaStatusResponse>;
    reset: () => void;
};
