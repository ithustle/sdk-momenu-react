import type { PaymentConfig, MCXPaymentRequest, MCXPaymentResponse, ReferencePaymentRequest, ReferencePaymentResponse, ReferenceStatusResponse } from '../types';
export declare class MoMenuPaymentClient {
    private config;
    private isProcessing;
    private readonly DEFAULT_BASE_URL;
    constructor(config: PaymentConfig);
    private get headers();
    private request;
    /**
     * Process payment via Multicaixa Express (MCX)
     */
    payMCX(request: MCXPaymentRequest): Promise<MCXPaymentResponse>;
    /**
     * Generate Bank Reference for payment
     */
    payReference(request: ReferencePaymentRequest): Promise<ReferencePaymentResponse>;
    checkReferenceStatus(operationId: string, merchantTransactionId?: string): Promise<ReferenceStatusResponse>;
    getReferenceStatus(operationId: string, merchantTransactionId?: string): Promise<ReferenceStatusResponse>;
}
