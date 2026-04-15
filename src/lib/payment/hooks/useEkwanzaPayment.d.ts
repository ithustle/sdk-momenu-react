import type { EkwanzaPaymentRequest, EkwanzaPaymentResponse, EkwanzaStatusResponse, PollingConfig, PollingMetrics } from '../types';
export declare function useEkwanzaPayment(config?: Partial<PollingConfig>): {
    pay: (request: EkwanzaPaymentRequest) => Promise<EkwanzaPaymentResponse>;
    loading: boolean;
    data: EkwanzaPaymentResponse | null;
    error: any;
    paymentStatus: EkwanzaStatusResponse | null;
    isPolling: boolean;
    pollingMetrics: PollingMetrics | null;
    stopPolling: () => void;
    reset: () => void;
    checkStatus: (code: string, merchantTransactionId?: string) => Promise<EkwanzaStatusResponse>;
};
