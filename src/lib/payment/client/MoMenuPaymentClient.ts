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
  PollingConfig,
  PollingError,
  PollingMetrics,
} from '../types';

/**
 * Internal polling engine that manages the lifecycle of status polling.
 * Implements exponential backoff, timeout management, and error classification.
 * 
 * @internal
 */
class PollingEngine<T> {
  private config: Required<PollingConfig>;
  private attempts: number = 0;
  private currentInterval: number;
  private startTime: number = 0;
  private timeoutId: any = null;
  private stopped: boolean = false;
  private devMode: boolean;
  private qaMode: boolean;
  private pollingType: string;
  private pollingIdentifier: string;

  constructor(
    config: PollingConfig,
    defaults: Required<PollingConfig>,
    devMode: boolean = false,
    qaMode: boolean = false,
    pollingType: string = 'unknown',
    pollingIdentifier: string = ''
  ) {
    this.config = this.mergeWithDefaults(config, defaults);
    this.currentInterval = this.config.initialInterval;
    this.devMode = devMode;
    this.qaMode = qaMode;
    this.pollingType = pollingType;
    this.pollingIdentifier = pollingIdentifier;
  }

  /**
   * Merges user-provided config with defaults.
   * Ensures all required fields have values.
   */
  private mergeWithDefaults(
    config: PollingConfig,
    defaults: Required<PollingConfig>
  ): Required<PollingConfig> {
    return {
      initialInterval: config.initialInterval ?? defaults.initialInterval,
      backoffMultiplier: config.backoffMultiplier ?? defaults.backoffMultiplier,
      maxInterval: config.maxInterval ?? defaults.maxInterval,
      timeout: config.timeout ?? defaults.timeout,
      maxAttempts: config.maxAttempts ?? defaults.maxAttempts,
      enableBackoff: config.enableBackoff ?? defaults.enableBackoff,
      autoPolling: config.autoPolling ?? defaults.autoPolling,
    };
  }

  /**
   * Calculates the next interval using exponential backoff.
   * This is a pure function that doesn't modify state.
   * 
   * @returns Next interval in milliseconds, capped at maxInterval
   */
  private calculateNextInterval(): number {
    if (!this.config.enableBackoff) {
      return this.currentInterval;
    }

    const nextInterval = this.currentInterval * this.config.backoffMultiplier;
    return Math.min(nextInterval, this.config.maxInterval);
  }

  /**
   * Checks if polling should continue based on attempts and timeout.
   * 
   * @returns true if polling should continue, false otherwise
   */
  private shouldContinue(): boolean {
    if (this.stopped) {
      return false;
    }

    if (this.attempts >= this.config.maxAttempts) {
      return false;
    }

    const elapsedTime = Date.now() - this.startTime;
    if (elapsedTime >= this.config.timeout) {
      return false;
    }

    return true;
  }

  /**
   * Starts the polling loop.
   * 
   * @param checkFn - Function that performs the status check
   * @param isCompleteFn - Function that determines if the result is complete
   * @param onSuccess - Callback invoked when polling completes successfully
   * @param onError - Callback invoked when polling fails
   * @param onProgress - Optional callback invoked after each attempt with metrics
   * @returns Function to stop polling
   */
  start(
    checkFn: () => Promise<T>,
    isCompleteFn: (data: T) => boolean,
    onSuccess: (data: T) => void,
    onError: (error: PollingError) => void,
    onProgress?: (metrics: PollingMetrics) => void
  ): () => void {
    this.startTime = Date.now();
    this.stopped = false;
    this.attempts = 0;

    // Log polling start (Task 7.1)
    if (this.devMode) {
      console.log('[MoMenu Polling] Started', {
        type: this.pollingType,
        [this.pollingType === 'ekwanza' ? 'code' : 'operationId']: this.pollingIdentifier,
        config: {
          initialInterval: this.config.initialInterval,
          backoffMultiplier: this.config.backoffMultiplier,
          maxInterval: this.config.maxInterval,
          timeout: this.config.timeout,
          maxAttempts: this.config.maxAttempts,
          enableBackoff: this.config.enableBackoff,
        },
        timestamp: this.startTime,
      });
    }

    const poll = async () => {
      await this.poll(checkFn, isCompleteFn, onSuccess, onError, onProgress);
    };

    // Start first poll immediately
    poll();

    // Return stop function
    return () => this.stop();
  }

  /**
   * Performs a single polling attempt.
   * Handles the check, error classification, and scheduling of next attempt.
   */
  private async poll(
    checkFn: () => Promise<T>,
    isCompleteFn: (data: T) => boolean,
    onSuccess: (data: T) => void,
    onError: (error: PollingError) => void,
    onProgress?: (metrics: PollingMetrics) => void
  ): Promise<void> {
    // Increment attempts FIRST to avoid race condition
    this.attempts++;
    const elapsedTime = Date.now() - this.startTime;
    
    // Check if we should stop AFTER incrementing
    if (this.stopped) {
      // Log cancellation (Task 7.5)
      if (this.devMode) {
        console.log('[MoMenu Polling] Cancelled', {
          attempts: this.attempts,
          elapsedTime,
          timestamp: Date.now(),
        });
      }

      this.handlePollingError(
        'cancelled',
        'Polling was cancelled',
        undefined,
        onError
      );
      return;
    }

    if (this.attempts > this.config.maxAttempts) {
      this.handlePollingError(
        'max_attempts',
        `Maximum attempts (${this.config.maxAttempts}) reached`,
        undefined,
        onError
      );
      return;
    }

    if (elapsedTime >= this.config.timeout) {
      this.handlePollingError(
        'timeout',
        `Polling timeout (${this.config.timeout}ms) exceeded`,
        undefined,
        onError
      );
      return;
    }

    const nextInterval = this.calculateNextInterval();

    // Log each attempt (Task 7.2)
    if (this.devMode) {
      console.log('[MoMenu Polling] Attempt', {
        attempt: this.attempts,
        currentInterval: this.currentInterval,
        nextInterval: nextInterval,
        elapsedTime: elapsedTime,
        remainingTime: Math.max(0, this.config.timeout - elapsedTime),
        timestamp: Date.now(),
      });
    }

    // Invoke progress callback with current metrics
    if (onProgress) {
      const metrics: PollingMetrics = {
        startTime: this.startTime,
        attempts: this.attempts,
        currentInterval: this.currentInterval,
        nextInterval: nextInterval,
        elapsedTime: elapsedTime,
        remainingTime: Math.max(0, this.config.timeout - elapsedTime),
      };
      onProgress(metrics);
    }

    try {
      // Execute the check function
      const result = await checkFn();

      // Check if we're done
      if (isCompleteFn(result)) {
        // Log success (Task 7.3)
        if (this.devMode) {
          console.log('[MoMenu Polling] Success', {
            attempts: this.attempts,
            elapsedTime: Date.now() - this.startTime,
            status: 'paid',
            timestamp: Date.now(),
          });
        }

        onSuccess(result);
        return;
      }

      // Not complete yet, schedule next attempt
      if (this.shouldContinue()) {
        this.currentInterval = nextInterval;
        this.timeoutId = setTimeout(
          () => this.poll(checkFn, isCompleteFn, onSuccess, onError, onProgress),
          this.currentInterval
        );
      } else {
        // Limits reached after this attempt
        const finalElapsedTime = Date.now() - this.startTime;
        
        if (this.attempts > this.config.maxAttempts) {
          this.handlePollingError(
            'max_attempts',
            `Maximum attempts (${this.config.maxAttempts}) reached`,
            undefined,
            onError
          );
        } else if (finalElapsedTime >= this.config.timeout) {
          this.handlePollingError(
            'timeout',
            `Polling timeout (${this.config.timeout}ms) exceeded`,
            undefined,
            onError
          );
        }
      }
    } catch (err) {
      // Classify the error
      const errorType = this.classifyError(err);
      const statusCode = (err as any).statusCode || (err as any).status;

      // For non-recoverable errors, stop immediately
      if (errorType === 'client_error') {
        this.handlePollingError(
          'client_error',
          err instanceof Error ? err.message : 'Client error occurred',
          statusCode,
          onError,
          err instanceof Error ? err : undefined
        );
        return;
      }

      // For recoverable errors (network, 5xx), retry if we can
      if (this.shouldContinue()) {
        this.currentInterval = nextInterval;
        this.timeoutId = setTimeout(
          () => this.poll(checkFn, isCompleteFn, onSuccess, onError, onProgress),
          this.currentInterval
        );
      } else {
        // Can't retry anymore
        const errorMessage = err instanceof Error ? err.message : 'Polling failed';
        this.handlePollingError(
          errorType,
          errorMessage,
          statusCode,
          onError,
          err instanceof Error ? err : undefined
        );
      }
    }
  }

  /**
   * Classifies an error to determine retry strategy.
   * 
   * @param err - The error to classify
   * @returns Error type for PollingError
   */
  private classifyError(err: any): PollingError['type'] {
    // Network errors (connection issues)
    if (err instanceof Error) {
      const message = err.message.toLowerCase();
      if (
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('econnrefused') ||
        message.includes('etimedout') ||
        message.includes('enotfound')
      ) {
        return 'network';
      }
    }

    // HTTP status code errors
    const statusCode = (err as any).statusCode || (err as any).status;
    if (statusCode) {
      if (statusCode >= 400 && statusCode < 500) {
        return 'client_error';
      }
      if (statusCode >= 500 && statusCode < 600) {
        return 'server_error';
      }
    }

    // Default to network error for unknown errors
    return 'network';
  }

  /**
   * Creates a PollingError object with complete information.
   */
  private createPollingError(
    type: PollingError['type'],
    message: string,
    statusCode: number | undefined,
    elapsedTime: number,
    originalError?: Error
  ): PollingError {
    const error = new Error(message) as PollingError;
    error.name = 'PollingError';
    error.type = type;
    error.statusCode = statusCode;
    error.attempts = this.attempts;
    error.elapsedTime = elapsedTime;
    error.originalError = originalError;
    return error;
  }

  /**
   * Handles polling error by creating error object, logging, and invoking callback.
   * Centralizes error handling logic to avoid duplication.
   */
  private handlePollingError(
    type: PollingError['type'],
    message: string,
    statusCode: number | undefined,
    onError: (error: PollingError) => void,
    originalError?: Error
  ): void {
    const elapsedTime = Date.now() - this.startTime;
    const error = this.createPollingError(type, message, statusCode, elapsedTime, originalError);
    
    // Log error (Task 7.4) - only for actual errors, not cancellation
    if ((this.devMode || this.qaMode) && type !== 'cancelled') {
      console.error('[MoMenu Polling] Error', {
        type: error.type,
        statusCode: error.statusCode,
        attempts: error.attempts,
        elapsedTime: error.elapsedTime,
        message: error.message,
        timestamp: Date.now(),
      });
    }
    
    onError(error);
  }

  /**
   * Stops the polling loop.
   */
  stop(): void {
    this.stopped = true;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export class MoMenuPaymentClient {

  private config: PaymentConfig;
  private readonly DEFAULT_BASE_URL = 'https://api.momenu.online';
  private pollingConfig: Partial<PollingConfig> = {};

  constructor(config: PaymentConfig) {
    this.config = config;
  }

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
  setPollingConfig(config: Partial<PollingConfig>): void {
    this.validatePollingConfig(config);
    this.pollingConfig = { ...this.pollingConfig, ...config };
  }

  /**
   * Validates polling configuration.
   * @throws Error if initialInterval is less than 1000ms
   */
  private validatePollingConfig(config: Partial<PollingConfig>): void {
    if (config.initialInterval !== undefined && config.initialInterval < 1000) {
      throw new Error(
        `Invalid polling configuration: initialInterval must be at least 1000ms, got ${config.initialInterval}ms`
      );
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

  /**
   * @deprecated Use `checkEkwanzaStatus` instead. This alias is kept for backward compatibility.
   */
  async getEkwanzaStatus(
    code: string,
    merchantTransactionId?: string
  ): Promise<EkwanzaStatusResponse> {
    return this.checkEkwanzaStatus(code, merchantTransactionId);
  }

  /**
   * @deprecated Use `checkReferenceStatus` instead. This alias is kept for backward compatibility.
   */
  async getReferenceStatus(
    operationId: string,
    merchantTransactionId?: string
  ): Promise<ReferenceStatusResponse> {
    return this.checkReferenceStatus(operationId, merchantTransactionId);
  }

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
  pollEkwanzaStatus(
    code: string,
    options: {
      merchantTransactionId?: string;
      config?: Partial<PollingConfig>;
      onSuccess?: (data: EkwanzaStatusResponse) => void;
      onError?: (error: PollingError) => void;
      onProgress?: (metrics: PollingMetrics) => void;
    } = {}
  ): () => void {
    const { merchantTransactionId, config, onSuccess, onError, onProgress } = options;

    // Default configuration for E-kwanza
    const defaultConfig: Required<PollingConfig> = {
      initialInterval: 5000,
      backoffMultiplier: 1.5,
      maxInterval: 60000,
      timeout: 300000,
      maxAttempts: 60,
      enableBackoff: true,
      autoPolling: true,
    };

    // Merge configurations: defaults < global < method-specific
    const mergedConfig: PollingConfig = {
      ...defaultConfig,
      ...this.pollingConfig,
      ...config,
    };

    // Validate merged configuration
    this.validatePollingConfig(mergedConfig);

    // Create polling engine with devMode, qaMode, and identifier
    const engine = new PollingEngine<EkwanzaStatusResponse>(
      mergedConfig,
      defaultConfig,
      this.config.devMode || false,
      this.config.qaMode || false,
      'ekwanza',
      code
    );

    // Define check function
    const checkFn = () => this.checkEkwanzaStatus(code, merchantTransactionId);

    // Define completion condition
    const isCompleteFn = (data: EkwanzaStatusResponse) => data.status === 'paid';

    // Define success handler
    const successHandler = (data: EkwanzaStatusResponse) => {
      if (this.config.devMode || this.config.qaMode) {
        console.log('[MoMenu Polling] E-kwanza payment confirmed', {
          code,
          status: data.status,
          timestamp: Date.now(),
        });
      }
      onSuccess?.(data);
    };

    // Define error handler
    const errorHandler = (error: PollingError) => {
      if (this.config.devMode || this.config.qaMode) {
        console.error('[MoMenu Polling] E-kwanza polling failed', {
          code,
          type: error.type,
          attempts: error.attempts,
          elapsedTime: error.elapsedTime,
          message: error.message,
          timestamp: Date.now(),
        });
      }
      onError?.(error);
    };

    // Start polling
    return engine.start(checkFn, isCompleteFn, successHandler, errorHandler, onProgress);
  }

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
  pollReferenceStatus(
    operationId: string,
    options: {
      merchantTransactionId?: string;
      config?: Partial<PollingConfig>;
      onSuccess?: (data: ReferenceStatusResponse) => void;
      onError?: (error: PollingError) => void;
      onProgress?: (metrics: PollingMetrics) => void;
    } = {}
  ): () => void {
    const { merchantTransactionId, config, onSuccess, onError, onProgress } = options;

    // Default configuration for Reference payments
    const defaultConfig: Required<PollingConfig> = {
      initialInterval: 30000,
      backoffMultiplier: 1.5,
      maxInterval: 60000,
      timeout: 600000,
      maxAttempts: 20,
      enableBackoff: true,
      autoPolling: true,
    };

    // Merge configurations: defaults < global < method-specific
    const mergedConfig: PollingConfig = {
      ...defaultConfig,
      ...this.pollingConfig,
      ...config,
    };

    // Validate merged configuration
    this.validatePollingConfig(mergedConfig);

    // Create polling engine with devMode, qaMode, and identifier
    const engine = new PollingEngine<ReferenceStatusResponse>(
      mergedConfig,
      defaultConfig,
      this.config.devMode || false,
      this.config.qaMode || false,
      'reference',
      operationId
    );

    // Define check function
    const checkFn = () => this.checkReferenceStatus(operationId, merchantTransactionId);

    // Define completion condition
    const isCompleteFn = (data: ReferenceStatusResponse) => data.payment.status === 'paid';

    // Define success handler
    const successHandler = (data: ReferenceStatusResponse) => {
      if (this.config.devMode || this.config.qaMode) {
        console.log('[MoMenu Polling] Reference payment confirmed', {
          operationId,
          status: data.payment.status,
          timestamp: Date.now(),
        });
      }
      onSuccess?.(data);
    };

    // Define error handler
    const errorHandler = (error: PollingError) => {
      if (this.config.devMode || this.config.qaMode) {
        console.error('[MoMenu Polling] Reference polling failed', {
          operationId,
          type: error.type,
          attempts: error.attempts,
          elapsedTime: error.elapsedTime,
          message: error.message,
          timestamp: Date.now(),
        });
      }
      onError?.(error);
    };

    // Start polling
    return engine.start(checkFn, isCompleteFn, successHandler, errorHandler, onProgress);
  }
}
