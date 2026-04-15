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
});
