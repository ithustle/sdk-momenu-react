export class MoMenuPaymentClient {
    config;
    DEFAULT_BASE_URL = 'https://api.momenu.online';
    constructor(config) {
        this.config = config;
    }
    get baseUrl() {
        return this.config.baseUrl || this.DEFAULT_BASE_URL;
    }
    get headers() {
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
        };
        if (this.config.qaMode) {
            headers['x-env-qa'] = 'true';
        }
        // x-dev-mode not sent — not allowed by server CORS policy
        return headers;
    }
    async request(path, method = 'GET', body) {
        const url = `${this.baseUrl}${path}`;
        const options = {
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
        return data;
    }
    /**
     * Process payment via Multicaixa Express (MCX)
     */
    async payMCX(request) {
        return this.request('/api/payment/mcx', 'POST', request);
    }
    /**
     * Process payment via E-kwanza (QR Code)
     */
    async payEkwanza(request) {
        return this.request('/api/payment/ekwanza', 'POST', request);
    }
    /**
     * Generate Bank Reference for payment
     */
    async payReference(request) {
        return this.request('/api/payment/reference', 'POST', request);
    }
    /**
     * Check status of an E-kwanza payment
     */
    async getEkwanzaStatus(code, merchantTransactionId) {
        let path = `/api/payment/ekwanza/status/${code}`;
        if (merchantTransactionId) {
            path += `?merchantTransactionId=${merchantTransactionId}`;
        }
        return this.request(path, 'GET');
    }
    /**
     * Check status of a Bank Reference payment
     */
    async getReferenceStatus(operationId, merchantTransactionId) {
        let path = `/api/payment/reference/status/${operationId}`;
        if (merchantTransactionId) {
            path += `?merchantTransactionId=${merchantTransactionId}`;
        }
        return this.request(path, 'GET');
    }
    /**
     * Start polling for E-kwanza status
     */
    pollEkwanzaStatus(code, options = {}) {
        const { intervalMs = 5000, onSuccess, onError, maxAttempts = 60, merchantTransactionId } = options;
        let attempts = 0;
        let timeoutId;
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
            }
            catch (error) {
                onError?.(error);
            }
        };
        poll();
        return () => clearTimeout(timeoutId);
    }
    /**
     * Start polling for Reference status
     */
    pollReferenceStatus(operationId, options = {}) {
        const { intervalMs = 30000, onSuccess, onError, maxAttempts = 20, merchantTransactionId } = options;
        let attempts = 0;
        let timeoutId;
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
            }
            catch (error) {
                onError?.(error);
            }
        };
        poll();
        return () => clearTimeout(timeoutId);
    }
}
