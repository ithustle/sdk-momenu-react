import type { PaymentConfig, MCXPaymentRequest, MCXPaymentResponse, ReferencePaymentRequest, ReferencePaymentResponse, ReferenceStatusResponse } from '../types';
export declare class MoMenuPaymentClient {
    private config;
    private isProcessing;
    constructor(config: PaymentConfig);
    private get baseUrl();
    private get headers();
    private request;
    payMCX(request: MCXPaymentRequest): Promise<MCXPaymentResponse>;
    payReference(request: ReferencePaymentRequest): Promise<ReferencePaymentResponse>;
    checkReferenceStatus(operationId: string, merchantTransactionId?: string): Promise<ReferenceStatusResponse>;
}
