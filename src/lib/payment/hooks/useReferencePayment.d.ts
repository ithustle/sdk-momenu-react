import type { ReferencePaymentRequest, ReferencePaymentResponse, ReferenceStatusResponse } from '../types';
import type { MoMenuPaymentError } from '../utils/errors';
interface UseReferencePaymentOptions {
    /** Auto-poll the reference status at intervals until paid */
    autoPoll?: boolean;
    /** Poll interval in ms (default: 10000) */
    pollInterval?: number;
}
export declare function useReferencePayment(options?: UseReferencePaymentOptions): {
    pay: (request: ReferencePaymentRequest) => Promise<ReferencePaymentResponse>;
    loading: boolean;
    checkingStatus: boolean;
    data: ReferencePaymentResponse | null;
    error: MoMenuPaymentError | null;
    paymentStatus: ReferenceStatusResponse | null;
    checkStatus: () => Promise<ReferenceStatusResponse>;
    reset: () => void;
};
export {};
