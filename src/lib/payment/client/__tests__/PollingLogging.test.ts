import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MoMenuPaymentClient } from '../MoMenuPaymentClient';

describe('Polling Logging and Observability', () => {
  let client: MoMenuPaymentClient;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Task 7.1: Log polling start', () => {
    it('should log polling start when devMode is enabled', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', devMode: true });
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'paid' })
      });

      const stopPolling = client.pollEkwanzaStatus('EKW123', {
        config: { initialInterval: 1000 }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      stopPolling();

      // Check that start log was called
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[MoMenu Polling] Started',
        expect.objectContaining({
          type: 'ekwanza',
          code: 'EKW123',
          config: expect.objectContaining({
            initialInterval: expect.any(Number),
            backoffMultiplier: expect.any(Number),
            maxInterval: expect.any(Number),
            timeout: expect.any(Number),
            maxAttempts: expect.any(Number),
            enableBackoff: expect.any(Boolean),
          }),
          timestamp: expect.any(Number),
        })
      );
    });

    it('should NOT log polling start when devMode is disabled', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', devMode: false });
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'paid' })
      });

      const stopPolling = client.pollEkwanzaStatus('EKW123', {
        config: { initialInterval: 1000 }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      stopPolling();

      // Check that start log was NOT called
      const startLogs = consoleLogSpy.mock.calls.filter(
        (call: any) => call[0] === '[MoMenu Polling] Started'
      );
      expect(startLogs.length).toBe(0);
    });
  });

  describe('Task 7.2: Log each attempt', () => {
    it('should log each polling attempt when devMode is enabled', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', devMode: true });
      
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            status: callCount < 3 ? 'pending' : 'paid' 
          })
        });
      });

      const stopPolling = client.pollEkwanzaStatus('EKW123', {
        config: { initialInterval: 1000, maxAttempts: 5 }
      });

      await new Promise(resolve => setTimeout(resolve, 3500));
      stopPolling();

      // Check that attempt logs were called
      const attemptLogs = consoleLogSpy.mock.calls.filter(
        (call: any) => call[0] === '[MoMenu Polling] Attempt'
      );
      
      expect(attemptLogs.length).toBeGreaterThan(0);
      
      // Verify structure of attempt log
      if (attemptLogs.length > 0) {
        const firstAttemptLog = attemptLogs[0][1];
        expect(firstAttemptLog).toMatchObject({
          attempt: expect.any(Number),
          currentInterval: expect.any(Number),
          nextInterval: expect.any(Number),
          elapsedTime: expect.any(Number),
          remainingTime: expect.any(Number),
          timestamp: expect.any(Number),
        });
      }
    });

    it('should NOT log attempts when devMode is disabled', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', devMode: false });
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'pending' })
      });

      const stopPolling = client.pollEkwanzaStatus('EKW123', {
        config: { initialInterval: 1000, maxAttempts: 2 }
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      stopPolling();

      // Check that attempt logs were NOT called
      const attemptLogs = consoleLogSpy.mock.calls.filter(
        (call: any) => call[0] === '[MoMenu Polling] Attempt'
      );
      expect(attemptLogs.length).toBe(0);
    });
  });

  describe('Task 7.3: Log success', () => {
    it('should log success when devMode is enabled', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', devMode: true });
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'paid' })
      });

      const onSuccess = vi.fn();
      const stopPolling = client.pollEkwanzaStatus('EKW123', {
        onSuccess,
        config: { initialInterval: 1000 }
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      stopPolling();

      // Check that success log was called
      const successLogs = consoleLogSpy.mock.calls.filter(
        (call: any) => call[0] === '[MoMenu Polling] Success'
      );
      
      expect(successLogs.length).toBeGreaterThan(0);
      
      if (successLogs.length > 0) {
        const successLog = successLogs[0][1];
        expect(successLog).toMatchObject({
          attempts: expect.any(Number),
          elapsedTime: expect.any(Number),
          status: 'paid',
          timestamp: expect.any(Number),
        });
      }
    });

    it('should NOT log success when devMode is disabled', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', devMode: false });
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'paid' })
      });

      const stopPolling = client.pollEkwanzaStatus('EKW123', {
        config: { initialInterval: 1000 }
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      stopPolling();

      // Check that success log was NOT called
      const successLogs = consoleLogSpy.mock.calls.filter(
        (call: any) => call[0] === '[MoMenu Polling] Success'
      );
      expect(successLogs.length).toBe(0);
    });
  });

  describe('Task 7.4: Log errors', () => {
    it('should log errors when devMode is enabled', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', devMode: true });
      
      // Mock fetch to throw an error with statusCode
      (global.fetch as any).mockImplementation(async () => {
        const response = {
          ok: false,
          status: 404,
          json: async () => ({ error: 'Not found' })
        };
        const data = await response.json();
        const error: any = new Error(`MoMenu Error (${response.status}): ${data.error}`);
        error.statusCode = response.status;
        error.data = data;
        throw error;
      });

      const onError = vi.fn();
      client.pollEkwanzaStatus('EKW123', {
        onError,
        config: { initialInterval: 1000 }
      });

      // Wait for the error to be processed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check that error log was called
      const errorLogs = consoleErrorSpy.mock.calls.filter(
        (call: any) => call[0] === '[MoMenu Polling] Error'
      );
      
      // The error callback should have been called
      expect(onError).toHaveBeenCalled();
      expect(errorLogs.length).toBeGreaterThan(0);
      
      if (errorLogs.length > 0) {
        const errorLog = errorLogs[0][1];
        expect(errorLog).toMatchObject({
          type: expect.any(String),
          attempts: expect.any(Number),
          elapsedTime: expect.any(Number),
          message: expect.any(String),
          timestamp: expect.any(Number),
        });
      }
    });

    it('should log errors when qaMode is enabled', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', qaMode: true });
      
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      });

      const onError = vi.fn();
      const stopPolling = client.pollEkwanzaStatus('EKW123', {
        onError,
        config: { initialInterval: 1000, maxAttempts: 1 }
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      stopPolling();

      // Check that error log was called
      const errorLogs = consoleErrorSpy.mock.calls.filter(
        (call: any) => call[0] === '[MoMenu Polling] Error'
      );
      
      expect(errorLogs.length).toBeGreaterThan(0);
    });

    it('should NOT log errors when both devMode and qaMode are disabled', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', devMode: false, qaMode: false });
      
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      });

      const onError = vi.fn();
      const stopPolling = client.pollEkwanzaStatus('EKW123', {
        onError,
        config: { initialInterval: 1000 }
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      stopPolling();

      // Check that error log was NOT called
      const errorLogs = consoleErrorSpy.mock.calls.filter(
        (call: any) => call[0] === '[MoMenu Polling] Error'
      );
      expect(errorLogs.length).toBe(0);
    });
  });

  describe('Task 7.5: Log cancellation', () => {
    it('should log cancellation when devMode is enabled', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', devMode: true });
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'pending' })
      });

      const onError = vi.fn();
      const stopPolling = client.pollEkwanzaStatus('EKW123', {
        onError,
        config: { initialInterval: 1000 }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      stopPolling();
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check that cancellation log was called
      const cancelLogs = consoleLogSpy.mock.calls.filter(
        (call: any) => call[0] === '[MoMenu Polling] Cancelled'
      );
      
      if (cancelLogs.length > 0) {
        const cancelLog = cancelLogs[0][1];
        expect(cancelLog).toMatchObject({
          attempts: expect.any(Number),
          elapsedTime: expect.any(Number),
          timestamp: expect.any(Number),
        });
      }
    });

    it('should NOT log cancellation when devMode is disabled', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', devMode: false });
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'pending' })
      });

      const stopPolling = client.pollEkwanzaStatus('EKW123', {
        config: { initialInterval: 1000 }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      stopPolling();
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check that cancellation log was NOT called
      const cancelLogs = consoleLogSpy.mock.calls.filter(
        (call: any) => call[0] === '[MoMenu Polling] Cancelled'
      );
      expect(cancelLogs.length).toBe(0);
    });
  });

  describe('Reference payment logging', () => {
    it('should log with correct type for reference payments', async () => {
      client = new MoMenuPaymentClient({ apiKey: 'test-key', devMode: true });
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          payment: { status: 'paid', message: 'Confirmed' }
        })
      });

      const stopPolling = client.pollReferenceStatus('OP123', {
        config: { initialInterval: 1000 }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      stopPolling();

      // Check that start log was called with correct type
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[MoMenu Polling] Started',
        expect.objectContaining({
          type: 'reference',
          operationId: 'OP123',
        })
      );
    });
  });
});
