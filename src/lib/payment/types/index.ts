// ─── Payment Configuration ───────────────────────────────────────────────────
export type PaymentMethod = 'mcx' | 'reference';


export interface PaymentConfig {
  /**
   * Public API key issued by MoMenu.
   *
   * This key is embedded in the browser bundle and sent via the `x-api-key`
   * header. It is **not** a secret — the backend enforces domain-level
   * restrictions (see `DOMAIN_NOT_ALLOWED` error). Do NOT store server-side
   * secrets in this field.
   */
  apiKey: string;
  /** QA mode — routes requests through the QA environment */
  qaMode?: boolean;
  /** Override the API base URL (e.g. for staging or self-hosted). Defaults to https://api.momenu.online */
  baseUrl?: string;
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

// ─── Entities ───────────────────────────────────────────────────────────────

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

// ─── Shared Request/Response ───────────────────────────────────────────────

export interface PaymentInfo {
  /** Amount in Kwanzas */
  amount: number;
  /** Required for MCX (format: 244XXXXXXXXX) */
  phoneNumber?: string;
}

export type SimulateResult =
  | 'success'
  | 'insufficient_balance'
  | 'timeout'
  | 'rejected'
  | 'invalid_number';


export interface BasePaymentResponse {
  success: boolean;
  error?: string;
  code?: string;
}

// ─── Multicaixa Express (MCX) ─────────────────────────────────────────────────

export interface MCXPaymentRequest {
  paymentInfo: PaymentInfo;
  products: PaymentProduct[];
  customer?: PaymentCustomer;
  /** QA mode only: simulate specific outcomes */
  simulateResult?: SimulateResult;
}

export interface MCXPaymentResponse extends BasePaymentResponse {
  transactionId?: string;
  invoiceUrl?: string;
}

// ─── Bank Reference ──────────────────────────────────────────────────────────

export interface ReferencePaymentRequest {
  paymentInfo: Pick<PaymentInfo, 'amount'>;
  products: PaymentProduct[];
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
    status: string;
    message?: string;
    invoiceUrl?: string;
  };
  invoiceUrl?: string;
}

// ─── Webhooks ───────────────────────────────────────────────────────────────

export type WebhookEvent = 'payment.confirmed' | 'invoice.created';

export interface WebhookPayload {
  event?: WebhookEvent;
  merchantTransactionId: string;
  operationStatus: '1' | '3' | '4' | '5'; // 1=Paid, 3=Cancelled, 4=Failed, 5=Error
  operationData?: Record<string, unknown>;
  invoiceUrl?: string;
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export type PaymentErrorCode =
  | 'MISSING_API_KEY'
  | 'INVALID_API_KEY'
  | 'DOMAIN_NOT_ALLOWED'
  | 'INVALID_AMOUNT'
  | 'AMOUNT_MISMATCH'
  | 'MISSING_PHONE'
  | 'MISSING_RESTAURANT_ID'
  | 'RATE_LIMIT_EXCEEDED'
  | 'PAYMENT_RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'INVOICE_NOT_FOUND';

export interface PaymentError extends BasePaymentResponse {
  success: false;
  error: string;
  code: PaymentErrorCode;
}
