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

    const url = `${this.DEFAULT_BASE_URL}${path}`;

    const options: RequestInit = {
      method,
      headers: this.headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (this.config.qaMode || this.config.devMode) {
        console.log(`[MoMenu SDK] ${method} ${path}`, {
          body: body ? body : undefined,
          status: response.status,
          response: data
        });
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Request failed';
        const error = new Error(`MoMenu Error (${response.status}): ${errorMessage}`);
        (error as any).data = data;
        
        console.error(`[MoMenu SDK] Request Error:`, {
          path,
          status: response.status,
          data
        });
        
        throw error;
      }

      return data as T;
    } catch (err) {
      if (!(err instanceof Error) || !err.message.includes('MoMenu Error')) {
        console.error(`[MoMenu SDK] Network/Unexpected Error:`, err);
      }
      throw err;
    }
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


  async checkEkwanzaStatus(
    code: string,
    merchantTransactionId?: string
  ): Promise<EkwanzaStatusResponse> {
    let path = `/api/payment/ekwanza/status/${code}`;
    if (merchantTransactionId) {
      path += `?merchantTransactionId=${merchantTransactionId}`;
    }
    return this.request<EkwanzaStatusResponse>(path, 'GET');
  }

  
  async checkReferenceStatus(
    operationId: string,
    merchantTransactionId?: string
  ): Promise<ReferenceStatusResponse> {
    let path = `/api/payment/reference/status/${operationId}`;
    if (merchantTransactionId) {
      path += `?merchantTransactionId=${merchantTransactionId}`;
    }
    return this.request<ReferenceStatusResponse>(path, 'GET');
  }

  
  async getEkwanzaStatus(
    code: string,
    merchantTransactionId?: string
  ): Promise<EkwanzaStatusResponse> {
    return this.checkEkwanzaStatus(code, merchantTransactionId);
  }

 
  async getReferenceStatus(
    operationId: string,
    merchantTransactionId?: string
  ): Promise<ReferenceStatusResponse> {
    return this.checkReferenceStatus(operationId, merchantTransactionId);
  }
}
