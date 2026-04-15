import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MoMenuPaymentClient } from '../MoMenuPaymentClient';

describe('MoMenuPaymentClient', () => {
  const config = {
    apiKey: 'test-api-key',
    qaMode: true
  };
  
  let client: MoMenuPaymentClient;

  beforeEach(() => {
    client = new MoMenuPaymentClient(config);
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  it('should send the correct headers including apiKey', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    await client.payMCX({
      paymentInfo: { amount: 1000, phoneNumber: '244923000000' }
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.momenu.online'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-api-key': 'test-api-key',
          'x-env-qa': 'true'
        })
      })
    );
  });

  it('should handle API errors correctly', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' })
    });

    await expect(client.payMCX({
      paymentInfo: { amount: 1000, phoneNumber: '244923000000' }
    })).rejects.toThrow(/MoMenu Error \(401\): Unauthorized/);
  });

  it('should format the payload accurately for MCX', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'pay_123', success: true })
    });

    await client.payMCX({
      paymentInfo: { amount: 2500, phoneNumber: '244945000000' }
    });

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body.paymentInfo.amount).toBe(2500);
    expect(body.paymentInfo.phoneNumber).toBe('244945000000');
  });

  describe('Polling Configuration', () => {
    it('should accept and apply global polling configuration', () => {
      expect(() => {
        client.setPollingConfig({
          initialInterval: 3000,
          backoffMultiplier: 1.3,
          maxInterval: 30000,
        });
      }).not.toThrow();
    });

    it('should validate initialInterval is at least 1000ms', () => {
      expect(() => {
        client.setPollingConfig({
          initialInterval: 500,
        });
      }).toThrow(/initialInterval must be at least 1000ms/);
    });

    it('should allow exactly 1000ms as initialInterval', () => {
      expect(() => {
        client.setPollingConfig({
          initialInterval: 1000,
        });
      }).not.toThrow();
    });
  });

  describe('Manual Status Checks', () => {
    it('should check E-kwanza status without polling', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'paid' })
      });

      const result = await client.checkEkwanzaStatus('EKW123');
      
      expect(result.status).toBe('paid');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/payment/ekwanza/status/EKW123'),
        expect.any(Object)
      );
    });

    it('should check Reference status without polling', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          payment: { status: 'paid', message: 'Payment confirmed' }
        })
      });

      const result = await client.checkReferenceStatus('OP123');
      
      expect(result.payment.status).toBe('paid');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/payment/reference/status/OP123'),
        expect.any(Object)
      );
    });

    it('should support merchantTransactionId in status checks', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'pending' })
      });

      await client.checkEkwanzaStatus('EKW123', 'MERCHANT-TX-123');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('merchantTransactionId=MERCHANT-TX-123'),
        expect.any(Object)
      );
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain getEkwanzaStatus as alias', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'paid' })
      });

      const result = await client.getEkwanzaStatus('EKW123');
      
      expect(result.status).toBe('paid');
    });

    it('should maintain getReferenceStatus as alias', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          payment: { status: 'paid', message: 'Confirmed' }
        })
      });

      const result = await client.getReferenceStatus('OP123');
      
      expect(result.payment.status).toBe('paid');
    });
  });

  describe('Advanced Polling', () => {
    it('should start polling for E-kwanza with default config', async () => {
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            status: callCount === 1 ? 'pending' : 'paid' 
          })
        });
      });

      const onSuccess = vi.fn();
      const stopPolling = client.pollEkwanzaStatus('EKW123', { 
        onSuccess,
        config: { initialInterval: 1000, maxAttempts: 5 } // Minimum valid interval
      });

      // Wait for polling to complete
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      stopPolling();
      expect(onSuccess).toHaveBeenCalled();
    }, 10000);

    it('should start polling for Reference with default config', async () => {
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            payment: { 
              status: callCount === 1 ? 'pending' : 'paid',
              message: 'Status'
            }
          })
        });
      });

      const onSuccess = vi.fn();
      const stopPolling = client.pollReferenceStatus('OP123', { 
        onSuccess,
        config: { initialInterval: 1000, maxAttempts: 5 } // Minimum valid interval
      });

      // Wait for polling to complete
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      stopPolling();
      expect(onSuccess).toHaveBeenCalled();
    }, 10000);

    it('should allow custom polling configuration', () => {
      const stopPolling = client.pollEkwanzaStatus('EKW123', {
        config: {
          initialInterval: 2000,
          maxAttempts: 10,
          timeout: 60000,
        },
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      expect(stopPolling).toBeInstanceOf(Function);
      stopPolling();
    });

    it('should invoke onProgress callback with metrics', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'pending' })
      });

      const onProgress = vi.fn();
      const stopPolling = client.pollEkwanzaStatus('EKW123', { 
        onProgress,
        config: { maxAttempts: 2, initialInterval: 1000 }
      });

      // Wait for at least one attempt
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      stopPolling();
      expect(onProgress).toHaveBeenCalled();
      
      if (onProgress.mock.calls.length > 0) {
        const metrics = onProgress.mock.calls[0][0];
        expect(metrics).toHaveProperty('attempts');
        expect(metrics).toHaveProperty('currentInterval');
        expect(metrics).toHaveProperty('elapsedTime');
      }
    });

    it('should return stop function that cancels polling', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'pending' })
      });

      const onError = vi.fn();
      const onSuccess = vi.fn();
      const stopPolling = client.pollEkwanzaStatus('EKW123', { 
        onError,
        onSuccess,
        config: { initialInterval: 1000 }
      });

      // Wait for first poll to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Stop polling
      stopPolling();

      // Wait a bit to ensure callback is invoked
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Either onError should be called with cancelled, or onSuccess should not be called
      // (depending on timing of when stop was called)
      expect(onSuccess).not.toHaveBeenCalled();
      
      // If onError was called, it should be with cancelled type
      if (onError.mock.calls.length > 0) {
        const error = onError.mock.calls[0][0];
        expect(error.type).toBe('cancelled');
      }
    }, 10000);
  });
});
