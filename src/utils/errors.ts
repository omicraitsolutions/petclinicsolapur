// Turns raw errors from the network / backend into short messages that are
// safe and understandable to show to clinic staff.

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return typeof err === 'string' ? err : '';
}

const NETWORK_PATTERN = /failed to fetch|networkerror|network request failed|load failed|fetch failed/i;

export function friendlyError(err: unknown, fallback: string): string {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'You appear to be offline. Please check your internet connection and try again.';
  }
  if (NETWORK_PATTERN.test(messageOf(err))) {
    return 'Could not reach the server. Please check your internet connection and try again.';
  }
  return fallback;
}

export function friendlyAuthError(err: unknown): string {
  const message = messageOf(err);
  if (/invalid login credentials|invalid credentials/i.test(message)) return 'Incorrect email or password.';
  if (/email not confirmed/i.test(message)) return 'Please confirm your email address before logging in.';
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Please wait a minute and try again.';
  return friendlyError(err, 'Unable to log in. Please try again.');
}
