import { useState, useCallback, useRef, useEffect } from 'react';
import { useMoMenuPayment } from './useMoMenuPayment';
import type { 
  ReferencePaymentRequest, 
  ReferencePaymentResponse, 
  ReferenceStatusResponse 
} from '../types';

export function useReferencePayment() {
  const { client } = useMoMenuPayment();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReferencePaymentResponse | null>(null);
  const [error, setError] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<ReferenceStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const stopPollingRef = useRef<(() => void) | null>(null);

  const stopPolling = useCallback(() => {
    if (stopPollingRef.current) {
      stopPollingRef.current();
      stopPollingRef.current = null;
      setIsPolling(false);
    }
  }, []);

  const pollStatus = useCallback((operationId: string, merchantTransactionId?: string) => {
    stopPolling();
    setIsPolling(true);
    
    stopPollingRef.current = client.pollReferenceStatus(operationId, {
      merchantTransactionId,
      onSuccess: (statusData) => {
        setPaymentStatus(statusData);
        setIsPolling(false);
      },
      onError: (err) => {
        setError(err);
        setIsPolling(false);
      }
    });
  }, [client, stopPolling]);

  const pay = useCallback(async (request: ReferencePaymentRequest) => {
    setLoading(true);
    setError(null);
    setPaymentStatus(null);
    
    try {
      const response = await client.payReference(request);
      setData(response);
      
      if (response.success && response.operationId) {
        pollStatus(response.operationId, response.transactionId);
      }
      
      return response;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, pollStatus]);

  const reset = useCallback(() => {
    stopPolling();
    setData(null);
    setError(null);
    setLoading(false);
    setPaymentStatus(null);
  }, [stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { 
    pay, 
    loading, 
    data, 
    error, 
    paymentStatus, 
    isPolling, 
    stopPolling, 
    reset 
  };
}
