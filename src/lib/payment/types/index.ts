// ─── Payment Configuration ───────────────────────────────────────────────────
export type PaymentMethod = 'mcx' | 'reference';


export interface PaymentConfig {
  apiKey: string;
  qaMode?: boolean;
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
  products?: PaymentProduct[];
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
  operationData?: any;
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
