/**
 * Format a number as currency with commas as thousands separators
 * @param price - The price number to format
 * @returns Formatted price string with commas (e.g., "1,997")
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US');
};

/**
 * Format a number as currency with dollar sign and commas
 * @param price - The price number to format
 * @returns Formatted price string with dollar sign and commas (e.g., "$1,997")
 */
export const formatCurrency = (price: number): string => {
  return `$${formatPrice(price)}`;
};
