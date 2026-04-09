import { useState, useCallback } from 'react';
import { useMoMenuPayment } from './useMoMenuPayment';
export function useMCXPayment() {
    const { client } = useMoMenuPayment();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const pay = useCallback(async (request) => {
        setLoading(true);
        setError(null);
        try {
            const response = await client.payMCX(request);
            setData(response);
            return response;
        }
        catch (err) {
            setError(err);
            throw err;
        }
        finally {
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
