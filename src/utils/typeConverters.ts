
/**
 * Safely converts a string to a number
 * Returns the original value if conversion fails
 */
export const safeParseInt = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Safely converts a number to a string
 */
export const safeToString = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

/**
 * Type guard to check if a value is a JSON object
 */
export const isJsonObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};
