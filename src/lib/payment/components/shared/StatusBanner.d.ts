import React from 'react';
interface StatusBannerProps {
    type: 'success' | 'error' | 'warning';
    message: string;
    action?: React.ReactNode;
}
export declare const StatusBanner: React.FC<StatusBannerProps>;
export {};
