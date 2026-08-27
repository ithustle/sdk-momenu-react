import type {
  PaymentConfig,
  MCXPaymentRequest,
  MCXPaymentResponse,
  ReferencePaymentRequest,
  ReferencePaymentResponse,
  ReferenceStatusResponse,
} from '../types';
import { validateAmount, validatePhoneNumber } from '../utils/validation';

export class MoMenuPaymentClient {

  private config: PaymentConfig;
  private isProcessing = false;
  private readonly DEFAULT_BASE_URL = 'https://api.momenu.online';

  constructor(config: PaymentConfig) {
    // Force QA mode if requested, but protect production
    const isProduction =
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD === true);

    if (isProduction) {
      this.config = { ...config, qaMode: false };
    } else {
      this.config = config;
    }
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
    body?: any,
    retries = 2
  ): Promise<T> {
    const url = `${this.DEFAULT_BASE_URL}${path}`;

    if (body) {
      console.log(`[MoMenu SDK] Request to ${path}:`, body);
    }

    const options: RequestInit = {
      method,
      headers: this.headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      const contentType = response.headers.get('content-type');
      let data: any;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        console.error(`[MoMenu SDK] API Error (${response.status}):`, data);
        
        if (retries > 0 && response.status >= 500) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
          return this.request(path, method, body, retries - 1);
        }

        const errorMessage = data.error || data.message || 'Erro inesperado na MoMenu';
        throw new Error(`MoMenu Error (${response.status}): ${errorMessage}`);
      }

      return data as T;
    } catch (err: any) {
      if (retries > 0 && err.name === 'TypeError' && err.message === 'Failed to fetch') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return this.request(path, method, body, retries - 1);
      }

      console.error('[MoMenu SDK] Connection Error:', err);
      throw err;
    }
  }

  async payMCX(request: MCXPaymentRequest): Promise<MCXPaymentResponse> {
    if (this.isProcessing) throw new Error('Pagamento em curso...');
    
    // Validate
    const amountVal = validateAmount(request.paymentInfo.amount);
    if (!amountVal.isValid) throw new Error(amountVal.error);
    const phoneVal = validatePhoneNumber(request.paymentInfo.phoneNumber || '');
    if (!phoneVal.isValid) throw new Error(phoneVal.error);

    try {
      this.isProcessing = true;
      
      // Build clean payload
      const payload: any = {
        paymentInfo: {
          phoneNumber: request.paymentInfo.phoneNumber
        }
      };

      if (request.products && request.products.length > 0) {
        payload.products = request.products;
      } else {
        payload.paymentInfo.amount = Number(request.paymentInfo.amount);
      }

      if (request.customer) {
        payload.customer = request.customer;
      }
      
      if (request.simulateResult) {
        payload.simulateResult = request.simulateResult;
      }

      return await this.request<MCXPaymentResponse>('/api/payment/mcx', 'POST', payload);
    } finally {
      this.isProcessing = false;
    }
  }

  async payReference(request: ReferencePaymentRequest): Promise<ReferencePaymentResponse> {
    if (this.isProcessing) throw new Error('Pagamento em curso...');

    try {
      this.isProcessing = true;

      // Build clean payload
      const payload: any = {};

      if (request.products && request.products.length > 0) {
        payload.products = request.products;
      } else {
        payload.paymentInfo = {
          amount: Number(request.paymentInfo.amount)
        };
      }

      if (request.customer) {
        payload.customer = request.customer;
      }

      return await this.request<ReferencePaymentResponse>('/api/payment/reference', 'POST', payload);
    } finally {
      this.isProcessing = false;
    }
  }

  async checkReferenceStatus(operationId: string, merchantTransactionId?: string): Promise<ReferenceStatusResponse> {
    let path = `/api/payment/reference/status/${operationId}`;
    if (merchantTransactionId) path += `?merchantTransactionId=${merchantTransactionId}`;
    return this.request<ReferenceStatusResponse>(path, 'GET');
  }

  async getReferenceStatus(operationId: string, merchantTransactionId?: string): Promise<ReferenceStatusResponse> {
    return this.checkReferenceStatus(operationId, merchantTransactionId);
  }
}
