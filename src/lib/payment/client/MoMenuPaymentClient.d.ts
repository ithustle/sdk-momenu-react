import type { PaymentConfig, MCXPaymentRequest, MCXPaymentResponse, EkwanzaPaymentRequest, EkwanzaPaymentResponse, ReferencePaymentRequest, ReferencePaymentResponse, EkwanzaStatusResponse, ReferenceStatusResponse } from '../types';
export declare class MoMenuPaymentClient {
    private config;
    private readonly DEFAULT_BASE_URL;
    constructor(config: PaymentConfig);
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
    checkEkwanzaStatus(code: string, merchantTransactionId?: string): Promise<EkwanzaStatusResponse>;
    checkReferenceStatus(operationId: string, merchantTransactionId?: string): Promise<ReferenceStatusResponse>;
    getEkwanzaStatus(code: string, merchantTransactionId?: string): Promise<EkwanzaStatusResponse>;
    getReferenceStatus(operationId: string, merchantTransactionId?: string): Promise<ReferenceStatusResponse>;
}
