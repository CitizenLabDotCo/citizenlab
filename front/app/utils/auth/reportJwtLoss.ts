import { captureMessage, withScope } from '@sentry/react';
import { jwtDecode } from 'jwt-decode';

// A tenant's cookie-consent tool (typically loaded via their GTM container) can
// enumerate document.cookie and delete everything not on its own allow-list. Our
// auth cookie is not on those lists, so it gets deleted and the user is silently
// signed out. That is indistinguishable from an ordinary session expiry to the
// user, so it goes unreported. This reports it with enough context to tell the
// two apart and to identify which script is responsible. See TAN-8309.

// The exp claim of the last token we saw. Null means we have no reason to believe
// the user was signed in, so a missing cookie is unremarkable.
let knownExpiry: number | null = null;
let lastSeenToken: string | null = null;

export const rememberJwt = (jwt: string) => {
  if (jwt === lastSeenToken) return;

  lastSeenToken = jwt;
  try {
    knownExpiry = jwtDecode<{ exp: number }>(jwt).exp;
  } catch {
    knownExpiry = null;
  }
};

/** Call when the token is removed on purpose, so the removal is not reported. */
export const forgetJwt = () => {
  knownExpiry = null;
  lastSeenToken = null;
};

// Names only — never values, which would leak the tokens of any cookie present.
const cookieNames = (): string[] =>
  document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter(Boolean);

// Identifies the consent tool / tag manager that ran, which is the whole point of
// the report: it names the culprit without us having to reproduce per tenant.
const scriptHosts = (): string[] => {
  const hosts = new Set<string>();
  document.querySelectorAll<HTMLScriptElement>('script[src]').forEach((tag) => {
    try {
      hosts.add(new URL(tag.src, window.location.origin).hostname);
    } catch {
      // Ignore unparseable src attributes.
    }
  });
  return [...hosts];
};

const isFramed = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

/**
 * Reports that the auth cookie vanished while we still expected it to be there.
 * Natural expiry and deliberate sign-out are not reported.
 */
export const reportUnexpectedJwtLoss = () => {
  if (knownExpiry === null) return;

  const secondsUntilExpiry = knownExpiry - Math.floor(Date.now() / 1000);
  // The token had run out; the browser dropping the cookie is expected.
  if (secondsUntilExpiry <= 0) return;

  // Clearing first makes this one report per token: getJwt runs on every API
  // request, and a lost cookie stays lost.
  forgetJwt();
  const remainingCookies = cookieNames();

  withScope((scope) => {
    scope.setLevel('error');
    scope.setTags({
      tenant_host: window.location.hostname,
      in_iframe: isFramed(),
    });
    scope.setContext('jwt_loss', {
      path: window.location.pathname,
      seconds_until_expiry: secondsUntilExpiry,
      seconds_since_page_load: Math.round(performance.now() / 1000),
      remaining_cookies: remainingCookies,
      consent_cookie_also_gone: !remainingCookies.includes('cl2_consent'),
      script_hosts: scriptHosts(),
    });
    captureMessage('Auth cookie cl2_jwt disappeared without sign-out');
  });
};
