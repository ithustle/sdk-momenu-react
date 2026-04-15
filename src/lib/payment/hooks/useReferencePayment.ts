import { useState, useCallback } from 'react';
import { useMoMenuPayment } from './useMoMenuPayment';
import type { 
  ReferencePaymentRequest, 
  ReferencePaymentResponse, 
  ReferenceStatusResponse 
} from '../types';

export function useReferencePayment() {
  const { client } = useMoMenuPayment();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [data, setData] = useState<ReferencePaymentResponse | null>(null);
  const [error, setError] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<ReferenceStatusResponse | null>(null);

  const pay = useCallback(async (request: ReferencePaymentRequest) => {
    setLoading(true);
    setError(null);
    setPaymentStatus(null);
    
    try {
      const response = await client.payReference(request);
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
    if (!data?.operationId) {
      throw new Error('No operation ID available');
    }

    setCheckingStatus(true);
    setError(null);
    
    try {
      const statusData = await client.checkReferenceStatus(data.operationId, data.transactionId);
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
