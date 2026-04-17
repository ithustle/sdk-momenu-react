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
import { validateAmount, validatePhoneNumber } from '../utils/validation';

export class MoMenuPaymentClient {

  private config: PaymentConfig;
  private isProcessing = false;
  private readonly DEFAULT_BASE_URL = 'https://api.momenu.online';

  constructor(config: PaymentConfig) {
    // Environment detection to force disable debug/test flags in production
    const isProduction = 
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD === true);

    if (isProduction) {
      if (config.qaMode || config.devMode) {
        console.warn('[MoMenu SDK] Safeguard: qaMode/devMode detected in production environment. Forcing them to false.');
      }
      this.config = {
        ...config,
        qaMode: false,
        devMode: false
      };
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


      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Request failed';
        const error = new Error(`MoMenu Error (${response.status}): ${errorMessage}`);
        
        // Attach metadata for the developer to use programmatically
        (error as any).data = data;
        (error as any).status = response.status;
        (error as any).path = path;
        
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
    if (this.isProcessing) {
      throw new Error('Já existe um pagamento em curso. Por favor, aguarde.');
    }

    const amountVal = validateAmount(request.paymentInfo.amount);
    if (!amountVal.isValid) throw new Error(amountVal.error);

    const phoneVal = validatePhoneNumber(request.paymentInfo.phoneNumber || '');
    if (!phoneVal.isValid) throw new Error(phoneVal.error);

    try {
      this.isProcessing = true;
      return await this.request<MCXPaymentResponse>('/api/payment/mcx', 'POST', request);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process payment via E-kwanza (QR Code)
   */
  async payEkwanza(request: EkwanzaPaymentRequest): Promise<EkwanzaPaymentResponse> {
    if (this.isProcessing) {
      throw new Error('Já existe um pagamento em curso. Por favor, aguarde.');
    }

    const amountVal = validateAmount(request.paymentInfo.amount);
    if (!amountVal.isValid) throw new Error(amountVal.error);

    const phoneVal = validatePhoneNumber(request.paymentInfo.phoneNumber || '');
    if (!phoneVal.isValid) throw new Error(phoneVal.error);

    try {
      this.isProcessing = true;
      return await this.request<EkwanzaPaymentResponse>('/api/payment/ekwanza', 'POST', request);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Generate Bank Reference for payment
   */
  async payReference(request: ReferencePaymentRequest): Promise<ReferencePaymentResponse> {
    if (this.isProcessing) {
      throw new Error('Já existe um pagamento em curso. Por favor, aguarde.');
    }

    const amountVal = validateAmount(request.paymentInfo.amount);
    if (!amountVal.isValid) throw new Error(amountVal.error);

    try {
      this.isProcessing = true;
      return await this.request<ReferencePaymentResponse>('/api/payment/reference', 'POST', request);
    } finally {
      this.isProcessing = false;
    }
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
