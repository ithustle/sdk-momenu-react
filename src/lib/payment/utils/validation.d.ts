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
/**
 * Validates that the sum of product prices × quantities matches the declared amount.
 * The MoMenu API rejects mismatches with AMOUNT_MISMATCH.
 */
export declare function validateProductsSum(amount: number, products: {
    productPrice: number;
    productQuantity: number;
}[]): {
    isValid: boolean;
    error?: string;
};
