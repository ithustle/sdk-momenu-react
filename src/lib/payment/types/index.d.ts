export interface PaymentConfig {
    /** Merchant API Key */
    apiKey: string;
    /** Whether to use the QA environment (adds x-env-qa header) */
    qaMode?: boolean;
    /** Whether to use development mode (adds x-dev-mode header, localhost only) */
    devMode?: boolean;
}
export interface PaymentTheme {
    primaryColor?: string;
    primaryHoverColor?: string;
    borderRadius?: string;
    backgroundColor?: string;
    cardColor?: string;
    textColor?: string;
    fontFamily?: string;
}
export interface PaymentProduct {
    /** Unique product ID */
    id: string;
    /** Product display name */
    productName: string;
    /** Unit price in Kwanzas */
    productPrice: number;
    /** Quantity of items */
    productQuantity: number;
    /** IVA rate (0 to 14, default: 14) */
    iva?: number;
}
export interface PaymentCustomer {
    /** Customer's full name */
    name: string;
    /** Tax identification number (NIF) */
    nif?: string;
    /** Contact phone number */
    phone?: string;
}
export interface PaymentInfo {
    /** Amount in Kwanzas */
    amount: number;
    /** Required for MCX and E-kwanza (format: 244XXXXXXXXX) */
    phoneNumber?: string;
}
export type SimulateResult = 'success' | 'insufficient_balance' | 'timeout' | 'rejected' | 'invalid_number';
export interface BasePaymentResponse {
    success: boolean;
    error?: string;
    code?: string;
}
export interface MCXPaymentRequest {
    paymentInfo: PaymentInfo;
    products?: PaymentProduct[];
    customer?: PaymentCustomer;
    /** QA mode only: simulate specific outcomes */
    simulateResult?: SimulateResult;
}
export interface MCXPaymentResponse extends BasePaymentResponse {
    transactionId?: string;
    invoiceUrl?: string;
}
export interface EkwanzaPaymentRequest {
    paymentInfo: PaymentInfo;
    products?: PaymentProduct[];
    customer?: PaymentCustomer;
}
export interface EkwanzaPaymentResponse extends BasePaymentResponse {
    code?: string;
    qrCode?: string;
    expirationDate?: string;
    paymentTimeout?: number;
    merchantTransactionId?: string;
}
export interface EkwanzaStatusResponse extends BasePaymentResponse {
    status: 'paid' | 'pending';
    operationCode?: string;
    invoiceUrl?: string;
}
export interface ReferencePaymentRequest {
    paymentInfo: Pick<PaymentInfo, 'amount'>;
    products?: PaymentProduct[];
    customer?: PaymentCustomer;
}
export interface ReferencePaymentResponse extends BasePaymentResponse {
    operationId?: string;
    referenceNumber?: string;
    entity?: string;
    dueDate?: string;
    transactionId?: string;
}
export interface ReferenceStatusResponse extends BasePaymentResponse {
    payment: {
        status: 'paid' | 'pending';
        message: string;
    };
    invoiceUrl?: string;
}
export type WebhookEvent = 'payment.confirmed' | 'invoice.created';
export interface WebhookPayload {
    event?: WebhookEvent;
    merchantTransactionId: string;
    ekwanzaTransactionId?: string;
    operationStatus: '1' | '3' | '4' | '5';
    operationData?: any;
    invoiceUrl?: string;
}
/**
 * Configuration for polling behavior when checking payment status.
 *
 * Polling is used to periodically check payment status until it's confirmed or times out.
 * This configuration allows fine-tuning of the polling strategy to balance between
 * responsiveness and server load.
 *
 * @example
 * // Aggressive polling for E-kwanza (fast payments)
 * const config: PollingConfig = {
 *   initialInterval: 3000,
 *   backoffMultiplier: 1.3,
 *   maxInterval: 30000,
 *   timeout: 180000
 * };
 *
 * @example
 * // Conservative polling for bank references (slower payments)
 * const config: PollingConfig = {
 *   initialInterval: 60000,
 *   backoffMultiplier: 1.2,
 *   maxInterval: 300000,
 *   timeout: 1800000
 * };
 */
export interface PollingConfig {
    /**
     * Initial interval between status check requests in milliseconds.
     * Must be at least 1000ms (1 second).
     *
     * @default 5000 for E-kwanza, 30000 for Reference payments
     * @example 5000 // Check every 5 seconds initially
     */
    initialInterval?: number;
    /**
     * Multiplier applied to the interval after each attempt (exponential backoff).
     * Higher values reduce server load but increase wait time.
     *
     * @default 1.5
     * @example 1.5 // With initialInterval=5000: 5s → 7.5s → 11.25s → 16.875s
     */
    backoffMultiplier?: number;
    /**
     * Maximum interval between requests in milliseconds.
     * Prevents exponential backoff from growing indefinitely.
     *
     * @default 60000 (1 minute)
     * @example 60000 // Never wait more than 1 minute between checks
     */
    maxInterval?: number;
    /**
     * Total timeout for polling in milliseconds.
     * Polling stops after this duration even if payment is still pending.
     *
     * @default 300000 (5 minutes) for E-kwanza, 600000 (10 minutes) for Reference
     * @example 300000 // Give up after 5 minutes
     */
    timeout?: number;
    /**
     * Maximum number of status check attempts.
     * Polling stops after this many attempts regardless of elapsed time.
     *
     * @default 60 for E-kwanza, 20 for Reference payments
     * @example 60 // Try at most 60 times
     */
    maxAttempts?: number;
    /**
     * Whether to enable exponential backoff.
     * When false, uses constant interval (initialInterval).
     *
     * @default true
     * @example true // Gradually increase interval between checks
     */
    enableBackoff?: boolean;
    /**
     * Whether to automatically start polling after payment creation.
     * When false, polling must be started manually.
     *
     * @default true
     * @example false // Disable for webhook-based integrations
     */
    autoPolling?: boolean;
}
/**
 * Error type for polling operations.
 * Extends the standard Error interface with additional context about the polling failure.
 */
export interface PollingError extends Error {
    /**
     * Category of error that occurred during polling.
     *
     * - `network`: Connection issues (timeout, DNS failure, connection refused)
     * - `timeout`: Total polling timeout exceeded
     * - `max_attempts`: Maximum number of attempts reached
     * - `client_error`: 4xx HTTP error (invalid request, not found, etc.)
     * - `server_error`: 5xx HTTP error (server unavailable, internal error)
     * - `cancelled`: Polling was manually cancelled by user
     */
    type: 'network' | 'timeout' | 'max_attempts' | 'client_error' | 'server_error' | 'cancelled';
    /**
     * HTTP status code if the error was from an HTTP response.
     * Undefined for network errors or timeouts.
     *
     * @example 404 // Not found
     * @example 500 // Internal server error
     */
    statusCode?: number;
    /**
     * Number of polling attempts made before the error occurred.
     *
     * @example 15 // Failed after 15 attempts
     */
    attempts: number;
    /**
     * Total time elapsed since polling started, in milliseconds.
     *
     * @example 45000 // 45 seconds elapsed
     */
    elapsedTime: number;
    /**
     * Additional error data from the API response, if available.
     */
    data?: any;
    /**
     * The original error that caused the polling failure, if applicable.
     * Useful for debugging and error chaining.
     */
    originalError?: Error;
}
/**
 * Metrics collected during a polling session.
 * Provides observability into polling behavior for debugging and optimization.
 *
 * @example
 * // Typical metrics during polling
 * const metrics: PollingMetrics = {
 *   startTime: 1678901234567,
 *   attempts: 5,
 *   currentInterval: 11250,
 *   nextInterval: 16875,
 *   elapsedTime: 45000,
 *   remainingTime: 255000
 * };
 */
export interface PollingMetrics {
    /**
     * Unix timestamp (milliseconds) when polling started.
     *
     * @example 1678901234567
     */
    startTime: number;
    /**
     * Number of status check attempts made so far.
     *
     * @example 5 // Fifth attempt
     */
    attempts: number;
    /**
     * Current interval between requests in milliseconds.
     * This value increases with exponential backoff.
     *
     * @example 11250 // Currently waiting 11.25 seconds between checks
     */
    currentInterval: number;
    /**
     * Next interval that will be used in milliseconds.
     * Shows the result of applying backoff multiplier.
     *
     * @example 16875 // Next check will wait 16.875 seconds
     */
    nextInterval: number;
    /**
     * Total time elapsed since polling started, in milliseconds.
     *
     * @example 45000 // 45 seconds have passed
     */
    elapsedTime: number;
    /**
     * Time remaining until timeout, in milliseconds.
     * Calculated as: timeout - elapsedTime
     *
     * @example 255000 // 4 minutes 15 seconds remaining
     */
    remainingTime: number;
}
export type PaymentErrorCode = 'MISSING_API_KEY' | 'INVALID_API_KEY' | 'DOMAIN_NOT_ALLOWED' | 'INVALID_AMOUNT' | 'AMOUNT_MISMATCH' | 'MISSING_PHONE' | 'MISSING_RESTAURANT_ID' | 'RATE_LIMIT_EXCEEDED' | 'PAYMENT_RATE_LIMIT_EXCEEDED' | 'INTERNAL_ERROR' | 'INVOICE_NOT_FOUND';
export interface PaymentError extends BasePaymentResponse {
    success: false;
    error: string;
    code: PaymentErrorCode;
}
