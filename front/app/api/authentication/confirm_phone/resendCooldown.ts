// The backend refuses a new SMS confirmation code until a minute after the
// previous one (Confirmation::RESEND_INTERVAL), and answers every phone code
// request - accepted or refused - with the number of seconds still to wait.
// Recording it here rather than passing it through the authentication state
// keeps it available on the confirmation step no matter which of the four paths
// sent the code (signup, login, re-confirmation, new number).

export const RESEND_INTERVAL_SECONDS = 60;

let resendAllowedAt: number | null = null;

export const setResendCooldown = (seconds: number) => {
  resendAllowedAt = Date.now() + seconds * 1000;
};

export const secondsUntilResendAllowed = () => {
  if (resendAllowedAt === null) return 0;

  return Math.max(0, Math.ceil((resendAllowedAt - Date.now()) / 1000));
};

// The seconds left according to a rejected request, or undefined if the error is
// about something else.
export const tooSoonRetryAfter = (error: any): number | undefined => {
  const baseError = error?.errors?.base?.[0];

  return baseError?.error === 'too_soon' ? baseError.retry_after : undefined;
};
