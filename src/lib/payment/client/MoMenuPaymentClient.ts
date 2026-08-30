import type {
  PaymentConfig,
  PaymentErrorCode,
  MCXPaymentRequest,
  MCXPaymentResponse,
  ReferencePaymentRequest,
  ReferencePaymentResponse,
  ReferenceStatusResponse,
} from '../types';
import { MoMenuPaymentError } from '../utils/errors';
import {
  validateAmount,
  validatePhoneNumber,
  validateProductsSum,
} from '../utils/validation';

interface MCXPayload {
  paymentInfo: { amount: number; phoneNumber: string };
  products: MCXPaymentRequest['products'];
  instantWithdraw: true;
  customer?: MCXPaymentRequest['customer'];
  simulateResult?: MCXPaymentRequest['simulateResult'];
}

interface ReferencePayload {
  paymentInfo: { amount: number };
  products: ReferencePaymentRequest['products'];
  instantWithdraw: true;
  customer?: ReferencePaymentRequest['customer'];
}

const DEFAULT_BASE_URL = 'https://api.momenu.online';
const REQUEST_TIMEOUT_MS = 30_000;

export class MoMenuPaymentClient {

  private config: PaymentConfig;
  private isProcessing = false;

  constructor(config: PaymentConfig) {
    // Force QA mode off in production
    const isProduction =
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ||
      (typeof import.meta !== 'undefined' && (import.meta as Record<string, any>).env?.PROD === true);

    if (isProduction) {
      this.config = { ...config, qaMode: false };
    } else {
      this.config = config;
    }
  }

  private get baseUrl(): string {
    return this.config.baseUrl || DEFAULT_BASE_URL;
  }

  private get headers(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey,
    };

    if (this.config.qaMode) {
      headers['x-env-qa'] = 'true';
    }

    return headers;
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown,
    retries = 2
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    if (this.config.qaMode && body) {
      console.log(`[MoMenu SDK] Request to ${path}`);
    }

    const options: RequestInit = {
      method,
      headers: this.headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    // AbortController for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    options.signal = controller.signal;

    try {
      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let data: Record<string, unknown>;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        if (this.config.qaMode) {
          console.error(`[MoMenu SDK] API Error (${response.status})`);
        }

        // Retry on 5xx or 429 (rate limiting)
        const shouldRetry = response.status >= 500 || response.status === 429;
        if (retries > 0 && shouldRetry) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
          return this.request<T>(path, method, body, retries - 1);
        }

        const errorMessage =
          (data.error as string) || (data.message as string) || 'Erro inesperado na MoMenu';
        const code = (data.code as PaymentErrorCode) || 'INTERNAL_ERROR';
        throw new MoMenuPaymentError(errorMessage, code, response.status);
      }

      return data as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof MoMenuPaymentError) {
        throw err;
      }

      const isAbortError = err instanceof DOMException && err.name === 'AbortError';
      const isNetworkError = err instanceof TypeError && err.message === 'Failed to fetch';

      if (retries > 0 && (isNetworkError || isAbortError)) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return this.request<T>(path, method, body, retries - 1);
      }

      if (this.config.qaMode) {
        console.error('[MoMenu SDK] Connection Error:', err instanceof Error ? err.message : String(err));
      }

      if (isAbortError) {
        throw new MoMenuPaymentError('Tempo limite excedido', 'INTERNAL_ERROR');
      }

      throw err;
    }
  }

  async payMCX(request: MCXPaymentRequest): Promise<MCXPaymentResponse> {
    if (this.isProcessing) {
      throw new MoMenuPaymentError('Pagamento em curso...', 'INTERNAL_ERROR');
    }

    // Validate
    const amountVal = validateAmount(request.paymentInfo.amount);
    if (!amountVal.isValid) {
      throw new MoMenuPaymentError(amountVal.error!, 'INVALID_AMOUNT');
    }
    const phoneVal = validatePhoneNumber(request.paymentInfo.phoneNumber || '');
    if (!phoneVal.isValid) {
      throw new MoMenuPaymentError(phoneVal.error!, 'MISSING_PHONE');
    }
    const sumVal = validateProductsSum(request.paymentInfo.amount, request.products);
    if (!sumVal.isValid) {
      throw new MoMenuPaymentError(sumVal.error!, 'AMOUNT_MISMATCH');
    }

    try {
      this.isProcessing = true;

      const payload: MCXPayload = {
        paymentInfo: {
          amount: Number(request.paymentInfo.amount),
          phoneNumber: request.paymentInfo.phoneNumber!,
        },
        products: request.products,
        instantWithdraw: true,
      };

      if (request.customer) {
        payload.customer = request.customer;
      }

      if (this.config.qaMode && request.simulateResult) {
        payload.simulateResult = request.simulateResult;
      }

      return await this.request<MCXPaymentResponse>('/api/payment/mcx', 'POST', payload);
    } finally {
      this.isProcessing = false;
    }
  }

  async payReference(request: ReferencePaymentRequest): Promise<ReferencePaymentResponse> {
    if (this.isProcessing) {
      throw new MoMenuPaymentError('Pagamento em curso...', 'INTERNAL_ERROR');
    }

    // Validate
    const amountVal = validateAmount(request.paymentInfo.amount);
    if (!amountVal.isValid) {
      throw new MoMenuPaymentError(amountVal.error!, 'INVALID_AMOUNT');
    }
    const sumVal = validateProductsSum(request.paymentInfo.amount, request.products);
    if (!sumVal.isValid) {
      throw new MoMenuPaymentError(sumVal.error!, 'AMOUNT_MISMATCH');
    }

    try {
      this.isProcessing = true;

      const payload: ReferencePayload = {
        paymentInfo: {
          amount: Number(request.paymentInfo.amount),
        },
        products: request.products,
        instantWithdraw: true,
      };

      if (request.customer) {
        payload.customer = request.customer;
      }

      return await this.request<ReferencePaymentResponse>('/api/payment/reference', 'POST', payload);
    } finally {
      this.isProcessing = false;
    }
  }

  async checkReferenceStatus(
    operationId: string,
    merchantTransactionId?: string
  ): Promise<ReferenceStatusResponse> {
    let path = `/api/payment/reference/status/${operationId}`;
    if (merchantTransactionId) path += `?merchantTransactionId=${merchantTransactionId}`;
    return this.request<ReferenceStatusResponse>(path, 'GET');
  }
}
