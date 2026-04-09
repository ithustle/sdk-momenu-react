import { useState, useCallback } from 'react';
import { useMoMenuPayment } from './useMoMenuPayment';
import type { MCXPaymentRequest, MCXPaymentResponse } from '../types';

export function useMCXPayment() {
  
  const { client } = useMoMenuPayment();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MCXPaymentResponse | null>(null);
  const [error, setError] = useState<any>(null);

  const pay = useCallback(async (request: MCXPaymentRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.payMCX(request);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { pay, loading, data, error, reset };
}
