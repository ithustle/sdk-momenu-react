import { MoMenuPaymentClient } from '../client/MoMenuPaymentClient';
export interface MoMenuPaymentContextValue {
    client: MoMenuPaymentClient;
}
export declare const MoMenuPaymentContext: import("react").Context<MoMenuPaymentContextValue | null>;
export declare function useMoMenuPaymentContext(): MoMenuPaymentContextValue;
