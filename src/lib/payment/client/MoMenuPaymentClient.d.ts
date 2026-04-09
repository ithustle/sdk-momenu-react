import type { PaymentConfig, MCXPaymentRequest, MCXPaymentResponse, EkwanzaPaymentRequest, EkwanzaPaymentResponse, ReferencePaymentRequest, ReferencePaymentResponse, EkwanzaStatusResponse, ReferenceStatusResponse } from '../types';
export declare class MoMenuPaymentClient {
    private config;
    private readonly DEFAULT_BASE_URL;
    constructor(config: PaymentConfig);
    private get baseUrl();
    private get headers();
    private request;
    /**
     * Process payment via Multicaixa Express (MCX)
     */
    payMCX(request: MCXPaymentRequest): Promise<MCXPaymentResponse>;
    /**
     * Process payment via E-kwanza (QR Code)
     */
    payEkwanza(request: EkwanzaPaymentRequest): Promise<EkwanzaPaymentResponse>;
    /**
     * Generate Bank Reference for payment
     */
    payReference(request: ReferencePaymentRequest): Promise<ReferencePaymentResponse>;
    /**
     * Check status of an E-kwanza payment
     */
    getEkwanzaStatus(code: string, merchantTransactionId?: string): Promise<EkwanzaStatusResponse>;
    /**
     * Check status of a Bank Reference payment
     */
    getReferenceStatus(operationId: string, merchantTransactionId?: string): Promise<ReferenceStatusResponse>;
    /**
     * Start polling for E-kwanza status
     */
    pollEkwanzaStatus(code: string, options?: {
        merchantTransactionId?: string;
        intervalMs?: number;
        onSuccess?: (data: EkwanzaStatusResponse) => void;
        onError?: (error: any) => void;
        maxAttempts?: number;
    }): () => void;
    /**
     * Start polling for Reference status
     */
    pollReferenceStatus(operationId: string, options?: {
        merchantTransactionId?: string;
        intervalMs?: number;
        onSuccess?: (data: ReferenceStatusResponse) => void;
        onError?: (error: any) => void;
        maxAttempts?: number;
    }): () => void;
}
