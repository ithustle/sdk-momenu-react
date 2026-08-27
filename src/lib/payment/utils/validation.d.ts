/**
 * Validates if the amount is a positive number
 */
export declare function validateAmount(amount: number): {
    isValid: boolean;
    error?: string;
};
/**
 * Validates Angolan phone numbers in international format (244XXXXXXXXX)
 */
export declare function validatePhoneNumber(phone: string): {
    isValid: boolean;
    error?: string;
};
