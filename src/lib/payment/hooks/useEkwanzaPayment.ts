import { useState, useCallback, useRef, useEffect } from 'react';
import { useMoMenuPayment } from './useMoMenuPayment';
import type { 
  EkwanzaPaymentRequest, 
  EkwanzaPaymentResponse, 
  EkwanzaStatusResponse,
  PollingConfig,
  PollingMetrics
} from '../types';

export function useEkwanzaPayment(config?: Partial<PollingConfig>) {
  const { client } = useMoMenuPayment();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EkwanzaPaymentResponse | null>(null);
  const [error, setError] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<EkwanzaStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingMetrics, setPollingMetrics] = useState<PollingMetrics | null>(null);
  
  const stopPollingRef = useRef<(() => void) | null>(null);

  const stopPolling = useCallback(() => {
    if (stopPollingRef.current) {
      stopPollingRef.current();
      stopPollingRef.current = null;
      setIsPolling(false);
      setPollingMetrics(null);
    }
  }, []);

  const pollStatus = useCallback((code: string, merchantTransactionId?: string) => {
    stopPolling();
    setIsPolling(true);
    
    stopPollingRef.current = client.pollEkwanzaStatus(code, {
      merchantTransactionId,
      config,
      onSuccess: (statusData) => {
        setPaymentStatus(statusData);
        setIsPolling(false);
        setPollingMetrics(null);
      },
      onError: (err) => {
        setError(err);
        setIsPolling(false);
        setPollingMetrics(null);
      },
      onProgress: (metrics) => {
        setPollingMetrics(metrics);
      }
    });
  }, [client, stopPolling, config]);

  const pay = useCallback(async (request: EkwanzaPaymentRequest) => {
    setLoading(true);
    setError(null);
    setPaymentStatus(null);
    
    try {
      const response = await client.payEkwanza(request);
      setData(response);
      
      if (response.success && response.code) {
        pollStatus(response.code, response.merchantTransactionId);
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
    setPollingMetrics(null);
  }, [stopPolling]);

  const checkStatus = useCallback(async (code: string, merchantTransactionId?: string) => {
    try {
      const statusData = await client.checkEkwanzaStatus(code, merchantTransactionId);
      setPaymentStatus(statusData);
      return statusData;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  }, [client]);

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
    pollingMetrics,
    stopPolling, 
    reset,
    checkStatus
  };
}
