/**
 * What a render is allowed to fetch.
 *
 * The page runs code the model just wrote, and it holds a token that reads this
 * layout's reporting data. So it may talk to the app it was opened on and to that
 * app's API, and to nothing else unless an operator has listed it: a request to any
 * other host can carry the token, or the rows it answered with, off the platform,
 * and nothing in the request tells a font host apart from a collector.
 *
 * Gotenberg draws this line at private addresses with --chromium-deny-private-ips.
 * This is the stricter, request-level half; the container's network policy is the other.
 */

const PRIVATE_HOSTNAMES = new Set(["localhost", "metadata.google.internal"]);
const PRIVATE_SUFFIXES = [".localhost", ".local", ".internal", ".lan"];

const isPrivateIpv4 = (host: string): boolean => {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!match) return false;
  const a = Number(match[1]);
  const b = Number(match[2]);
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    (a === 100 && b >= 64 && b <= 127)
  );
};

const isPrivateIpv6 = (host: string): boolean => {
  const bare = host.replace(/^\[|\]$/g, "").toLowerCase();
  return (
    bare === "::1" ||
    bare === "::" ||
    bare.startsWith("fc") ||
    bare.startsWith("fd") ||
    bare.startsWith("fe80") ||
    bare.startsWith("::ffff:")
  );
};

export const isPrivateHost = (hostname: string): boolean => {
  const host = hostname.toLowerCase();
  if (PRIVATE_HOSTNAMES.has(host)) return true;
  if (PRIVATE_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  return isPrivateIpv4(host) || isPrivateIpv6(host);
};

const parseUrl = (value: string | undefined): URL | null => {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const originOf = (url: string | undefined): string | null =>
  parseUrl(url)?.origin ?? null;

/**
 * The origin to match a request against. `ws://host` is the same place as
 * `http://host`, and a socket is a way out of this page like any other, so both
 * schemes are compared against the one list of http(s) origins.
 */
const comparableOrigin = (target: URL): string => {
  if (target.protocol === "ws:") return `http://${target.host}`;
  if (target.protocol === "wss:") return `https://${target.host}`;
  return target.origin;
};

/**
 * Origins an operator has added by hand, comma-separated and matched exactly — a
 * tile server, a CDN that serves the SPA's assets from its own domain. Empty by
 * default. The app's own origins travel with each render request instead, which is
 * why `localhost` in development needs nothing here.
 *
 * A private address is dropped rather than honoured: a slip in this one variable
 * must not open a path to the cloud host's metadata endpoint or to a database on
 * this network.
 */
export const parseAllowedOrigins = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((entry) => parseUrl(entry.trim()))
    .filter(
      (url): url is URL =>
        url !== null &&
        (url.protocol === "http:" || url.protocol === "https:") &&
        !isPrivateHost(url.hostname)
    )
    .map((url) => url.origin);

/** Read once: the environment does not change while the service runs. */
export const CONFIGURED_ORIGINS = parseAllowedOrigins(
  process.env.ALLOWED_EGRESS_ORIGINS
);

/**
 * Whether a request the page makes may go out.
 *
 * An allowed origin is allowed even when it is a private host: in development the
 * tenant is `localhost` and its API is `localhost` on another port, and refusing
 * those would be refusing the harness itself. A request that names no readable
 * origin at all grants nothing.
 */
export const isAllowedRequest = (
  url: string,
  allowedOrigins: (string | undefined)[]
): boolean => {
  const target = parseUrl(url);
  if (!target) return false;

  const allowed = allowedOrigins
    .map(originOf)
    .filter((origin) => origin !== null);
  if (allowed.length === 0) return false;
  if (allowed.includes(comparableOrigin(target))) return true;
  // The draft bundle and anything the app inlines.
  if (target.protocol === "blob:" || target.protocol === "data:") return true;

  return false;
};
