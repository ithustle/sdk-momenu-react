import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MoMenuPaymentClient } from '../client/MoMenuPaymentClient';
import type { MCXPaymentRequest, ReferencePaymentRequest } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SAMPLE_PRODUCTS = [
  { id: 'p-001', productName: 'Item Teste', productPrice: 2500, productQuantity: 1, iva: 14 },
];

const SAMPLE_CUSTOMER = { name: 'João Silva', nif: '123456789' };

function mockFetchOk(response: Record<string, unknown>) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function mockFetchError(status: number, body: Record<string, unknown>) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function capturePayload(mockFetch: ReturnType<typeof vi.fn>): any {
  expect(mockFetch).toHaveBeenCalledTimes(1);
  const [, options] = mockFetch.mock.calls[0];
  return JSON.parse(options.body);
}

// ─── payMCX ────────────────────────────────────────────────────────────────────

describe('MoMenuPaymentClient.payMCX', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = mockFetchOk({ success: true, transactionId: 'tx-123', invoiceUrl: 'https://inv.test' });
    global.fetch = fetchMock as any;
  });

  it('envia instantWithdraw: true no payload', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request: MCXPaymentRequest = {
      paymentInfo: { amount: 2500, phoneNumber: '244923456789' },
      products: SAMPLE_PRODUCTS,
    };

    await client.payMCX(request);
    const payload = capturePayload(fetchMock);

    expect(payload.instantWithdraw).toBe(true);
  });

  it('envia paymentInfo.amount E products simultaneamente (não um OU outro)', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request: MCXPaymentRequest = {
      paymentInfo: { amount: 2500, phoneNumber: '244923456789' },
      products: SAMPLE_PRODUCTS,
    };

    await client.payMCX(request);
    const payload = capturePayload(fetchMock);

    expect(payload.paymentInfo).toBeDefined();
    expect(payload.paymentInfo.amount).toBe(2500);
    expect(payload.paymentInfo.phoneNumber).toBe('244923456789');
    expect(payload.products).toEqual(SAMPLE_PRODUCTS);
  });

  it('envia customer e simulateResult em QA mode', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key', qaMode: true });
    const request: MCXPaymentRequest = {
      paymentInfo: { amount: 5000, phoneNumber: '244923456789' },
      products: [{ id: 'p1', productName: 'Item', productPrice: 5000, productQuantity: 1 }],
      customer: SAMPLE_CUSTOMER,
      simulateResult: 'success',
    };

    await client.payMCX(request);
    const payload = capturePayload(fetchMock);

    expect(payload.customer).toEqual(SAMPLE_CUSTOMER);
    expect(payload.simulateResult).toBe('success');
  });

  it('NÃO envia simulateResult fora do QA mode (produção)', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request: MCXPaymentRequest = {
      paymentInfo: { amount: 5000, phoneNumber: '244923456789' },
      products: [{ id: 'p1', productName: 'Item', productPrice: 5000, productQuantity: 1 }],
      simulateResult: 'success',
    };

    await client.payMCX(request);
    const payload = capturePayload(fetchMock);

    expect(payload.simulateResult).toBeUndefined();
  });

  it('envia para o endpoint /api/payment/mcx via POST', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request: MCXPaymentRequest = {
      paymentInfo: { amount: 1000, phoneNumber: '244923456789' },
      products: [{ id: 'p1', productName: 'Item', productPrice: 1000, productQuantity: 1 }],
    };

    await client.payMCX(request);

    expect(fetchMock.mock.calls[0][0]).toContain('/api/payment/mcx');
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });

  it('lança MoMenuPaymentError com code quando amount é inválido', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request = {
      paymentInfo: { amount: 0, phoneNumber: '244923456789' },
      products: SAMPLE_PRODUCTS,
    } as MCXPaymentRequest;

    await expect(client.payMCX(request)).rejects.toMatchObject({
      name: 'MoMenuPaymentError',
      code: 'INVALID_AMOUNT',
    });
  });

  it('lança MoMenuPaymentError com AMOUNT_MISMATCH quando soma != amount', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request: MCXPaymentRequest = {
      paymentInfo: { amount: 3000, phoneNumber: '244923456789' },
      products: [{ id: 'p1', productName: 'Item', productPrice: 2500, productQuantity: 1 }],
    };

    await expect(client.payMCX(request)).rejects.toMatchObject({
      name: 'MoMenuPaymentError',
      code: 'AMOUNT_MISMATCH',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('lança MoMenuPaymentError com code da API em erro 4xx', async () => {
    fetchMock = mockFetchError(401, { error: 'Unauthorized', code: 'INVALID_API_KEY' });
    global.fetch = fetchMock as any;

    const client = new MoMenuPaymentClient({ apiKey: 'bad-key' });
    const request: MCXPaymentRequest = {
      paymentInfo: { amount: 2500, phoneNumber: '244923456789' },
      products: SAMPLE_PRODUCTS,
    };

    await expect(client.payMCX(request)).rejects.toMatchObject({
      name: 'MoMenuPaymentError',
      code: 'INVALID_API_KEY',
      status: 401,
    });
  });
});

// ─── payReference ──────────────────────────────────────────────────────────────

describe('MoMenuPaymentClient.payReference', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = mockFetchOk({
      success: true,
      operationId: 'op-123',
      referenceNumber: '999888777',
      entity: '00345',
      dueDate: '2026-09-30',
      transactionId: 'tx-ref-001',
    });
    global.fetch = fetchMock as any;
  });

  it('envia instantWithdraw: true no payload', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request: ReferencePaymentRequest = {
      paymentInfo: { amount: 2500 },
      products: SAMPLE_PRODUCTS,
    };

    await client.payReference(request);
    const payload = capturePayload(fetchMock);

    expect(payload.instantWithdraw).toBe(true);
  });

  it('envia paymentInfo.amount E products simultaneamente', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request: ReferencePaymentRequest = {
      paymentInfo: { amount: 2500 },
      products: SAMPLE_PRODUCTS,
    };

    await client.payReference(request);
    const payload = capturePayload(fetchMock);

    expect(payload.paymentInfo).toBeDefined();
    expect(payload.paymentInfo.amount).toBe(2500);
    expect(payload.products).toEqual(SAMPLE_PRODUCTS);
  });

  it('envia para o endpoint /api/payment/reference via POST', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request: ReferencePaymentRequest = {
      paymentInfo: { amount: 1000 },
      products: [{ id: 'p1', productName: 'Item', productPrice: 1000, productQuantity: 1 }],
    };

    await client.payReference(request);

    expect(fetchMock.mock.calls[0][0]).toContain('/api/payment/reference');
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });

  it('rejeita montante inválido (zero)', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request = {
      paymentInfo: { amount: 0 },
      products: SAMPLE_PRODUCTS,
    } as ReferencePaymentRequest;

    await expect(client.payReference(request)).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejeita montante abaixo do mínimo (50 Kz)', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request = {
      paymentInfo: { amount: 30 },
      products: SAMPLE_PRODUCTS,
    } as ReferencePaymentRequest;

    await expect(client.payReference(request)).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejeita AMOUNT_MISMATCH quando soma != amount', async () => {
    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    const request: ReferencePaymentRequest = {
      paymentInfo: { amount: 5000 },
      products: [{ id: 'p1', productName: 'Item', productPrice: 2500, productQuantity: 1 }],
    };

    await expect(client.payReference(request)).rejects.toMatchObject({
      code: 'AMOUNT_MISMATCH',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ─── checkReferenceStatus ──────────────────────────────────────────────────────

describe('MoMenuPaymentClient.checkReferenceStatus', () => {
  it('faz GET para /api/payment/reference/status/:operationId', async () => {
    const fetchMock = mockFetchOk({
      success: true,
      payment: { status: 'paid', message: 'Pagamento confirmado' },
      invoiceUrl: 'https://inv.test',
    });
    global.fetch = fetchMock as any;

    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    await client.checkReferenceStatus('op-123');

    expect(fetchMock.mock.calls[0][0]).toContain('/api/payment/reference/status/op-123');
    expect(fetchMock.mock.calls[0][1].method).toBe('GET');
  });

  it('inclui merchantTransactionId como query param quando fornecido', async () => {
    const fetchMock = mockFetchOk({
      success: true,
      payment: { status: 'pending' },
    });
    global.fetch = fetchMock as any;

    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    await client.checkReferenceStatus('op-123', 'tx-456');

    expect(fetchMock.mock.calls[0][0]).toContain('merchantTransactionId=tx-456');
  });
});

// ─── baseUrl configurável ─────────────────────────────────────────────────────

describe('MoMenuPaymentClient baseUrl', () => {
  it('usa baseUrl personalizado quando fornecido', async () => {
    const fetchMock = mockFetchOk({ success: true, transactionId: 'tx' });
    global.fetch = fetchMock as any;

    const client = new MoMenuPaymentClient({ apiKey: 'test-key', baseUrl: 'https://staging.momenu.online' });
    await client.payMCX({
      paymentInfo: { amount: 2500, phoneNumber: '244923456789' },
      products: SAMPLE_PRODUCTS,
    });

    expect(fetchMock.mock.calls[0][0]).toContain('https://staging.momenu.online');
  });

  it('usa URL padrão quando baseUrl não fornecido', async () => {
    const fetchMock = mockFetchOk({ success: true, transactionId: 'tx' });
    global.fetch = fetchMock as any;

    const client = new MoMenuPaymentClient({ apiKey: 'test-key' });
    await client.payMCX({
      paymentInfo: { amount: 2500, phoneNumber: '244923456789' },
      products: SAMPLE_PRODUCTS,
    });

    expect(fetchMock.mock.calls[0][0]).toContain('https://api.momenu.online');
  });
});
