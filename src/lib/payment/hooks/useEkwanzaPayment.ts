import { useState, useCallback } from 'react';
import { useMoMenuPayment } from './useMoMenuPayment';
import type { 
  EkwanzaPaymentRequest, 
  EkwanzaPaymentResponse, 
  EkwanzaStatusResponse
} from '../types';

export function useEkwanzaPayment() {
  const { client } = useMoMenuPayment();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [data, setData] = useState<EkwanzaPaymentResponse | null>(null);
  const [error, setError] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<EkwanzaStatusResponse | null>(null);

  const pay = useCallback(async (request: EkwanzaPaymentRequest) => {
    setLoading(true);
    setError(null);
    setPaymentStatus(null);
    
    try {
      const response = await client.payEkwanza(request);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const checkStatus = useCallback(async () => {
    if (!data?.code) {
      throw new Error('No payment code available');
    }

    setCheckingStatus(true);
    setError(null);
    
    try {
      const statusData = await client.checkEkwanzaStatus(data.code, data.merchantTransactionId);
      setPaymentStatus(statusData);
      return statusData;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setCheckingStatus(false);
    }
  }, [client, data]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setCheckingStatus(false);
    setPaymentStatus(null);
  }, []);

  return { 
    pay, 
    loading,
    checkingStatus,
    data, 
    error, 
    paymentStatus,
    checkStatus,
    reset
  };
}
