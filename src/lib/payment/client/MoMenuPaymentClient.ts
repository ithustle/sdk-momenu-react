import type {
  PaymentConfig,
  MCXPaymentRequest,
  MCXPaymentResponse,
  EkwanzaPaymentRequest,
  EkwanzaPaymentResponse,
  ReferencePaymentRequest,
  ReferencePaymentResponse,
  EkwanzaStatusResponse,
  ReferenceStatusResponse,
} from '../types';

export class MoMenuPaymentClient {
  private config: PaymentConfig;
  private readonly DEFAULT_BASE_URL = 'https://api.momenu.online';

  constructor(config: PaymentConfig) {
    this.config = config;
  }

  private get baseUrl(): string {
    return this.config.baseUrl || this.DEFAULT_BASE_URL;
  }

  private get headers(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey,
    };

    if (this.config.qaMode) {
      headers['x-env-qa'] = 'true';
    }

    if (this.config.devMode) {
      headers['x-dev-mode'] = 'true';
    }

    return headers;
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: this.headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || data.message || 'Request failed';
      throw new Error(`MoMenu Error (${response.status}): ${errorMessage}`);
    }

    return data as T;
  }

  /**
   * Process payment via Multicaixa Express (MCX)
   */
  async payMCX(request: MCXPaymentRequest): Promise<MCXPaymentResponse> {
    return this.request<MCXPaymentResponse>('/api/payment/mcx', 'POST', request);
  }

  /**
   * Process payment via E-kwanza (QR Code)
   */
  async payEkwanza(request: EkwanzaPaymentRequest): Promise<EkwanzaPaymentResponse> {
    return this.request<EkwanzaPaymentResponse>('/api/payment/ekwanza', 'POST', request);
  }

  /**
   * Generate Bank Reference for payment
   */
  async payReference(request: ReferencePaymentRequest): Promise<ReferencePaymentResponse> {
    return this.request<ReferencePaymentResponse>('/api/payment/reference', 'POST', request);
  }

  /**
   * Check status of an E-kwanza payment
   */
  async getEkwanzaStatus(
    code: string,
    merchantTransactionId?: string
  ): Promise<EkwanzaStatusResponse> {
    let path = `/api/payment/ekwanza/status/${code}`;
    if (merchantTransactionId) {
      path += `?merchantTransactionId=${merchantTransactionId}`;
    }
    return this.request<EkwanzaStatusResponse>(path, 'GET');
  }

  /**
   * Check status of a Bank Reference payment
   */
  async getReferenceStatus(
    operationId: string,
    merchantTransactionId?: string
  ): Promise<ReferenceStatusResponse> {
    let path = `/api/payment/reference/status/${operationId}`;
    if (merchantTransactionId) {
      path += `?merchantTransactionId=${merchantTransactionId}`;
    }
    return this.request<ReferenceStatusResponse>(path, 'GET');
  }

  /**
   * Start polling for E-kwanza status
   */
  pollEkwanzaStatus(
    code: string,
    options: {
      merchantTransactionId?: string;
      intervalMs?: number;
      onSuccess?: (data: EkwanzaStatusResponse) => void;
      onError?: (error: any) => void;
      maxAttempts?: number;
    } = {}
  ): () => void {
    const { intervalMs = 5000, onSuccess, onError, maxAttempts = 60, merchantTransactionId } = options;
    let attempts = 0;
    let timeoutId: any;

    const poll = async () => {
      try {
        attempts++;
        const data = await this.getEkwanzaStatus(code, merchantTransactionId);

        if (data.status === 'paid') {
          onSuccess?.(data);
          return;
        }

        if (attempts >= maxAttempts) {
          onError?.(new Error('Max attempts reached'));
          return;
        }

        timeoutId = setTimeout(poll, intervalMs);
      } catch (error) {
        onError?.(error);
      }
    };

    poll();
    return () => clearTimeout(timeoutId);
  }

  /**
   * Start polling for Reference status
   */
  pollReferenceStatus(
    operationId: string,
    options: {
      merchantTransactionId?: string;
      intervalMs?: number;
      onSuccess?: (data: ReferenceStatusResponse) => void;
      onError?: (error: any) => void;
      maxAttempts?: number;
    } = {}
  ): () => void {
    const { intervalMs = 30000, onSuccess, onError, maxAttempts = 20, merchantTransactionId } = options;
    let attempts = 0;
    let timeoutId: any;

    const poll = async () => {
      try {
        attempts++;
        const data = await this.getReferenceStatus(operationId, merchantTransactionId);

        if (data.payment.status === 'paid') {
          onSuccess?.(data);
          return;
        }

        if (attempts >= maxAttempts) {
          onError?.(new Error('Max attempts reached'));
          return;
        }

        timeoutId = setTimeout(poll, intervalMs);
      } catch (error) {
        onError?.(error);
      }
    };

    poll();
    return () => clearTimeout(timeoutId);
  }
}
