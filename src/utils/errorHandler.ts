import { isAxiosError } from 'axios';

/**
 * Extracts and formats error messages from API responses
 * @param error - The error object from API calls
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // Return specific messages based on status codes
    switch (status) {
      case 400:
        return (
          message || 'Invalid request. Please check your input and try again.'
        );
      case 401:
        return 'You are not authorized to perform this action. Please log in again.';
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return message || 'The requested resource was not found.';
      case 409:
        return message || 'This action conflicts with existing data.';
      case 422:
        return message || 'The provided data is invalid.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'A server error occurred. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'The service is temporarily unavailable. Please try again later.';
      default:
        return message || 'An unexpected error occurred. Please try again.';
    }
  }

  // If it's a regular Error, return its message
  if (error instanceof Error) {
    return error.message;
  }

  // If it's a string, return it directly
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
}
