import type { PaymentConfig, MCXPaymentRequest, MCXPaymentResponse, EkwanzaPaymentRequest, EkwanzaPaymentResponse, ReferencePaymentRequest, ReferencePaymentResponse, EkwanzaStatusResponse, ReferenceStatusResponse, PollingConfig, PollingError, PollingMetrics } from '../types';
export declare class MoMenuPaymentClient {
    private config;
    private readonly DEFAULT_BASE_URL;
    private pollingConfig;
    constructor(config: PaymentConfig);
    /**
     * Configure global polling settings for this client instance.
     * These settings will be used as defaults for all polling operations.
     *
     * @param config - Partial polling configuration to merge with defaults
     * @throws Error if initialInterval is less than 1000ms
     *
     * @example
     * client.setPollingConfig({
     *   initialInterval: 3000,
     *   backoffMultiplier: 1.3,
     *   maxInterval: 30000
     * });
     */
    setPollingConfig(config: Partial<PollingConfig>): void;
    /**
     * Validates polling configuration.
     * @throws Error if initialInterval is less than 1000ms
     */
    private validatePollingConfig;
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
     * Manually check status of an E-kwanza payment (single request, no polling).
     * Use this method when you want to check status once without automatic retries.
     * For automatic polling with retries, use `pollEkwanzaStatus` instead.
     *
     * @param code - E-kwanza payment code
     * @param merchantTransactionId - Optional merchant transaction ID for tracking
     * @returns Current payment status
     *
     * @example
     * const status = await client.checkEkwanzaStatus('EKW123456');
     * if (status.status === 'paid') {
     *   console.log('Payment confirmed!');
     * }
     */
    checkEkwanzaStatus(code: string, merchantTransactionId?: string): Promise<EkwanzaStatusResponse>;
    /**
     * Manually check status of a Bank Reference payment (single request, no polling).
     * Use this method when you want to check status once without automatic retries.
     * For automatic polling with retries, use `pollReferenceStatus` instead.
     *
     * @param operationId - Reference payment operation ID
     * @param merchantTransactionId - Optional merchant transaction ID for tracking
     * @returns Current payment status
     *
     * @example
     * const status = await client.checkReferenceStatus('OP123456');
     * if (status.payment.status === 'paid') {
     *   console.log('Payment confirmed!');
     * }
     */
    checkReferenceStatus(operationId: string, merchantTransactionId?: string): Promise<ReferenceStatusResponse>;
    /**
     * @deprecated Use `checkEkwanzaStatus` instead. This alias is kept for backward compatibility.
     */
    getEkwanzaStatus(code: string, merchantTransactionId?: string): Promise<EkwanzaStatusResponse>;
    /**
     * @deprecated Use `checkReferenceStatus` instead. This alias is kept for backward compatibility.
     */
    getReferenceStatus(operationId: string, merchantTransactionId?: string): Promise<ReferenceStatusResponse>;
    /**
     * Start polling for E-kwanza payment status with advanced configuration.
     * Uses exponential backoff, timeout management, and comprehensive error handling.
     *
     * @param code - E-kwanza payment code
     * @param options - Polling options including callbacks and configuration
     * @returns Function to stop polling
     *
     * @example
     * const stopPolling = client.pollEkwanzaStatus('EKW123456', {
     *   onSuccess: (data) => console.log('Payment confirmed!', data),
     *   onError: (error) => console.error('Polling failed:', error),
     *   onProgress: (metrics) => console.log(`Attempt ${metrics.attempts}...`),
     *   config: {
     *     initialInterval: 3000,
     *     timeout: 180000
     *   }
     * });
     *
     * // Later, to cancel polling:
     * stopPolling();
     */
    pollEkwanzaStatus(code: string, options?: {
        merchantTransactionId?: string;
        config?: Partial<PollingConfig>;
        onSuccess?: (data: EkwanzaStatusResponse) => void;
        onError?: (error: PollingError) => void;
        onProgress?: (metrics: PollingMetrics) => void;
    }): () => void;
    /**
     * Start polling for Bank Reference payment status with advanced configuration.
     * Uses exponential backoff, timeout management, and comprehensive error handling.
     *
     * @param operationId - Reference payment operation ID
     * @param options - Polling options including callbacks and configuration
     * @returns Function to stop polling
     *
     * @example
     * const stopPolling = client.pollReferenceStatus('OP123456', {
     *   onSuccess: (data) => console.log('Payment confirmed!', data),
     *   onError: (error) => console.error('Polling failed:', error),
     *   onProgress: (metrics) => console.log(`Attempt ${metrics.attempts}...`),
     *   config: {
     *     initialInterval: 60000,
     *     timeout: 1800000
     *   }
     * });
     *
     * // Later, to cancel polling:
     * stopPolling();
     */
    pollReferenceStatus(operationId: string, options?: {
        merchantTransactionId?: string;
        config?: Partial<PollingConfig>;
        onSuccess?: (data: ReferenceStatusResponse) => void;
        onError?: (error: PollingError) => void;
        onProgress?: (metrics: PollingMetrics) => void;
    }): () => void;
}
