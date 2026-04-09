/**
 * Validates that the amount matches the sum of product prices and quantities.
 */
export function validateAmount(amount, products) {
    if (!products || products.length === 0) {
        return { valid: true };
    }
    const total = products.reduce((acc, p) => acc + (p.productPrice * p.productQuantity), 0);
    if (Math.abs(total - amount) > 0.01) { // Use epsilon for floating point comparison
        return {
            valid: false,
            error: `O valor total (${amount}) não coincide com a soma dos produtos (${total})`
        };
    }
    return { valid: true };
}
/**
 * Validates the Angolan phone number format (244XXXXXXXXX).
 */
export function validatePhone(phone) {
    const phoneRegex = /^244\d{9}$/;
    return phoneRegex.test(phone);
}
/**
 * Calculates the 2% processing fee.
 */
export function calculateFee(amount) {
    return amount * 0.02;
}
