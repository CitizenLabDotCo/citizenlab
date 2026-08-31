// A redirect_uri can only ever be an http(s) URL. Any other scheme —
// javascript:, data:, vbscript: — executes in the platform origin as soon as it
// is handed to window.location, so it is refused before any navigation happens.
const SAFE_PROTOCOLS = ['http:', 'https:'];

export const isSafeRedirectUrl = (value: string) => {
  try {
    return SAFE_PROTOCOLS.includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

// The navigation itself, wrapped so the consent screen's behaviour can be
// asserted: jsdom exposes window.location as a read-only property, so the call
// cannot be spied on where it happens.
export const navigateToUrl = (url: string) => {
  window.location.assign(url);
};
