/**
 * Validates if the amount is a positive number
 */
export function validateAmount(amount: number): { isValid: boolean; error?: string } {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: 'O valor deve ser um número válido.' };
  }
  if (amount <= 0) {
    return { isValid: false, error: 'O valor do pagamento deve ser superior a zero.' };
  }
  // Minimum amount for most Angolan payment gateways is usually around 50 Kz
  if (amount < 50) {
    return { isValid: false, error: 'O valor mínimo para pagamentos é de 50 Kz.' };
  }
  return { isValid: true };
}

/**
 * Validates Angolan phone numbers in international format (244XXXXXXXXX)
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  if (!phone) {
    return { isValid: false, error: 'O número de telefone é obrigatório.' };
  }

  // Remove spaces, dashes, or parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Check if it has 12 digits and starts with 244
  const angolaPhoneRegex = /^244[92][0-9]{8}$/;

  if (!angolaPhoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Número de telefone inválido. Use o formato internacional (ex: 244923000000).'
    };
  }

  return { isValid: true };
}

/**
 * Validates that the sum of product prices × quantities matches the declared amount.
 * The MoMenu API rejects mismatches with AMOUNT_MISMATCH.
 */
export function validateProductsSum(
  amount: number,
  products: { productPrice: number; productQuantity: number }[]
): { isValid: boolean; error?: string } {
  if (!products || products.length === 0) {
    return { isValid: true };
  }

  const sum = products.reduce(
    (acc, p) => acc + p.productPrice * p.productQuantity,
    0
  );

  if (sum !== amount) {
    return {
      isValid: false,
      error: `A soma dos produtos (${sum} Kz) não corresponde ao montante (${amount} Kz).`,
    };
  }

  return { isValid: true };
}
