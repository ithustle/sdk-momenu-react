import React from 'react';
interface CustomerDetailsFormProps {
    show: boolean;
    onToggle: (show: boolean) => void;
    name: string;
    onNameChange: (name: string) => void;
    nif: string;
    onNifChange: (nif: string) => void;
    disabled?: boolean;
    error?: string;
}
export declare const CustomerDetailsForm: React.FC<CustomerDetailsFormProps>;
export {};
