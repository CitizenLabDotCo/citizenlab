// Our prerender service adds this param to get past the cookie banner, and
// URLs that carry it are not prerendered. Facebook and LinkedIn re-fetch the
// page at og:url, so leaving it in gives them a page with no meta tags.
const PRERENDER_PARAM = 'yes-I-accept-cookies';

export default function getOgUrl() {
  const url = new URL(window.location.href);
  url.hash = '';
  // Deleting re-encodes the whole query, so only do it when needed.
  if (url.searchParams.has(PRERENDER_PARAM)) {
    url.searchParams.delete(PRERENDER_PARAM);
  }
  return url.toString();
}
