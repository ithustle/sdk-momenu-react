import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MoMenuPaymentClient } from '../MoMenuPaymentClient';
describe('MoMenuPaymentClient', () => {
    const config = {
        apiKey: 'test-api-key',
        qaMode: true
    };
    let client;
    beforeEach(() => {
        client = new MoMenuPaymentClient(config);
        // Reset fetch mock before each test
        global.fetch = vi.fn();
    });
    it('should send the correct headers including apiKey', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true })
        });
        await client.payMCX({
            paymentInfo: { amount: 1000, phoneNumber: '244923000000' }
        });
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://api.momenu.online'), expect.objectContaining({
            headers: expect.objectContaining({
                'Content-Type': 'application/json',
                'x-api-key': 'test-api-key',
                'x-env-qa': 'true'
            })
        }));
    });
    it('should handle API errors correctly', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ message: 'Unauthorized' })
        });
        await expect(client.payMCX({
            paymentInfo: { amount: 1000, phoneNumber: '244923000000' }
        })).rejects.toThrow(/MoMenu Error \(401\): Unauthorized/);
    });
    it('should format the payload accurately for MCX', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 'pay_123', success: true })
        });
        await client.payMCX({
            paymentInfo: { amount: 2500, phoneNumber: '244945000000' }
        });
        const body = JSON.parse(global.fetch.mock.calls[0][1].body);
        expect(body.paymentInfo.amount).toBe(2500);
        expect(body.paymentInfo.phoneNumber).toBe('244945000000');
    });
});
