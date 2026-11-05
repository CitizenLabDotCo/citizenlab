export const isYouTubeEmbedLink = (url?: string): boolean => {
  return !!url?.includes('youtube.com');
};

// A URL we hand to window.location must never carry a scheme the browser would
// execute in our own origin — javascript:, data:, vbscript:. Anything that is not
// an absolute http(s) URL is refused before any navigation happens.
const SAFE_REDIRECT_PROTOCOLS = ['http:', 'https:'];

export const isSafeRedirectUrl = (value: string) => {
  try {
    return SAFE_REDIRECT_PROTOCOLS.includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

// The navigation itself, wrapped so a caller's behaviour can be asserted: jsdom
// exposes window.location as a read-only property, so the call cannot be spied on
// where it happens. A URL that did not originate in our own code must go through
// isSafeRedirectUrl first.
export const navigateToUrl = (url: string) => {
  window.location.assign(url);
};
