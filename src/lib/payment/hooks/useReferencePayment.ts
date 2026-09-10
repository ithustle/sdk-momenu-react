import { useState, useCallback, useEffect } from 'react';
import { useMoMenuPayment } from './useMoMenuPayment';
import type {
  ReferencePaymentRequest,
  ReferencePaymentResponse,
  ReferenceStatusResponse
} from '../types';
import type { MoMenuPaymentError } from '../utils/errors';

interface UseReferencePaymentOptions {
  /** Auto-poll the reference status at intervals until paid */
  autoPoll?: boolean;
  /** Poll interval in ms (default: 10000) */
  pollInterval?: number;
}

export function useReferencePayment(options?: UseReferencePaymentOptions) {
  const { client } = useMoMenuPayment();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [data, setData] = useState<ReferencePaymentResponse | null>(null);
  const [error, setError] = useState<MoMenuPaymentError | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<ReferenceStatusResponse | null>(null);

  const autoPoll = options?.autoPoll ?? false;
  const pollInterval = options?.pollInterval ?? 10000;

  const pay = useCallback(async (request: ReferencePaymentRequest) => {
    setLoading(true);
    setError(null);
    setPaymentStatus(null);

    try {
      const response = await client.payReference(request);
      setData(response);
      return response;
    } catch (err: unknown) {
      setError(err as MoMenuPaymentError);
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
    } catch (err: unknown) {
      setError(err as MoMenuPaymentError);
      throw err;
    } finally {
      setCheckingStatus(false);
    }
  }, [client, data]);

  // Auto-polling
  useEffect(() => {
    if (!autoPoll || !data?.operationId || paymentStatus?.payment.status === 'paid') return;

    const interval = setInterval(async () => {
      try {
        await checkStatus();
      } catch {
        // silently ignore polling errors
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [autoPoll, data?.operationId, paymentStatus?.payment.status, pollInterval, checkStatus]);

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
