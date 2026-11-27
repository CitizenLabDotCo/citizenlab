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

// These wrap window.location so tests can mock them (jsdom's can't be spied
// on). URLs not from our own code must pass isSafeRedirectUrl first.
export const navigateToUrl = (url: string) => {
  window.location.assign(url);
};

export const reloadPage = () => {
  window.location.reload();
};
