/**
 * Normalizes backend, API, and network errors into clean, friendly user-facing messages.
 * Prevents raw technical stack traces, JSON schema dumps, or Groq API internals
 * from leaking into the UI.
 *
 * @param {Error|object|string} error - The caught error object, response payload, or error string
 * @param {number} [responseStatus] - Optional HTTP status code
 * @returns {string} - Clean, human-readable error message
 */
export function sanitizeErrorMessage(error, responseStatus) {
  const status = responseStatus || error?.status;

  // Rate limit / high demand
  if (status === 429) {
    return 'The quiz service is currently experiencing high demand. Please wait a moment and try again.';
  }

  // Extract raw error text from various possible payload formats or Error instances
  let raw = '';
  if (typeof error === 'string') {
    raw = error;
  } else if (typeof error?.error === 'string') {
    raw = error.error;
  } else if (typeof error?.error?.message === 'string') {
    raw = error.error.message;
  } else if (typeof error?.message === 'string') {
    raw = error.message;
  }

  raw = raw.trim();

  // If specific well-known friendly messages were thrown, preserve them directly
  if (
    raw === 'Unable to connect to the quiz service. Please check your connection and try again.' ||
    raw === 'The quiz response was incomplete. Please try again.' ||
    raw === 'Something went wrong while generating the quiz. Please try again.'
  ) {
    return raw;
  }

  // Detect technical errors, raw JSON dumps, or schema validation messages
  const isTechnical =
    !raw ||
    raw.includes('failed_generation') ||
    raw.includes('json_validate_failed') ||
    raw.includes('jsonschema') ||
    raw.includes('does not validate') ||
    raw.includes('invalid_request_error') ||
    raw.includes('openai/') ||
    raw.includes('groq') ||
    raw.startsWith('400 {') ||
    raw.startsWith('500 {') ||
    raw.startsWith('{') ||
    raw.length > 200;

  if (isTechnical) {
    return 'Something went wrong while generating the quiz. Please try again or rephrase your topic.';
  }

  return raw;
}
