/**
 * Formats a number as Angolan Kwanzas (AOA).
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
    }).format(amount);
}
/**
 * Formats an ISO date string to a human-readable format.
 */
export function formatDate(dateStr) {
    if (!dateStr)
        return '';
    try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('pt-AO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    }
    catch (e) {
        return dateStr;
    }
}
