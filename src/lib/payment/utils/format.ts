/**
 * Formats a number as Angolan Kwanzas (AOA).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
  }).format(amount);
}

/**
 * Formats an ISO date string to a human-readable format.
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Returns the URL only if it uses a safe protocol (http/https).
 * Prevents `javascript:` injection via API-supplied URLs.
 */
export function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return url;
    }
  } catch {
    // invalid URL
  }
  return undefined;
}
