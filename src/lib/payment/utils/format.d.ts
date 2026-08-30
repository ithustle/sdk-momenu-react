/**
 * Formats a number as Angolan Kwanzas (AOA).
 */
export declare function formatCurrency(amount: number): string;
/**
 * Formats an ISO date string to a human-readable format.
 */
export declare function formatDate(dateStr?: string): string;
/**
 * Returns the URL only if it uses a safe protocol (http/https).
 * Prevents `javascript:` injection via API-supplied URLs.
 */
export declare function sanitizeUrl(url?: string): string | undefined;
