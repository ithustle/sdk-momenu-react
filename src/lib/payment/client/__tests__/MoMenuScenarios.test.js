import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MoMenuPaymentClient } from '../MoMenuPaymentClient';
describe('MoMenu QA Magic Numbers', () => {
    const config = { apiKey: 'qa-test-api-key', qaMode: true };
    let client;
    beforeEach(() => {
        client = new MoMenuPaymentClient(config);
        global.fetch = vi.fn();
    });
    it('✅ 244900000000 - should result in Payment Success', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, transactionId: 'TX_SUCCESS' })
        });
        const response = await client.payMCX({
            paymentInfo: { amount: 1000, phoneNumber: '244900000000' }
        });
        expect(response.success).toBe(true);
    });
    it('❌ 244900000001 - should result in Insufficient Balance Error', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 402,
            json: () => Promise.resolve({
                success: false,
                error: 'Saldo Insuficiente'
            })
        });
        await expect(client.payMCX({
            paymentInfo: { amount: 1000, phoneNumber: '244900000001' }
        })).rejects.toThrow(/MoMenu Error \(402\): Saldo Insuficiente/);
    });
    it('❌ 244900000002 - should result in Timeout Error', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 504,
            json: () => Promise.resolve({
                success: false,
                error: 'Recusado pelo processador. Poderá ser TIMEOUT. Necessário contactar a área de suporte.'
            })
        });
        await expect(client.payMCX({
            paymentInfo: { amount: 1000, phoneNumber: '244900000002' }
        })).rejects.toThrow(/MoMenu Error \(504\): Recusado pelo processador/);
    });
    it('❌ 244900000003 - should result in Order Rejected by Customer Error', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 403,
            json: () => Promise.resolve({
                success: false,
                error: 'Recusado pelo cliente.'
            })
        });
        await expect(client.payMCX({
            paymentInfo: { amount: 1000, phoneNumber: '244900000003' }
        })).rejects.toThrow(/MoMenu Error \(403\): Recusado pelo cliente/);
    });
});
