/**
 * What a render is allowed to fetch.
 *
 * The page runs code the model just wrote. It may talk to the app it was opened on,
 * and to the public hosts the app itself loads from (a CDN, a font host). It may not
 * open files, and it may not reach anything on a private network: the metadata
 * endpoint of the cloud host, a database on the same network, this service itself.
 *
 * Gotenberg draws the same line with --chromium-deny-private-ips. This is the
 * request-level half; the container's network policy is the other.
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

const originOf = (url: string | undefined): string | null => {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

/**
 * Whether a request the page makes may go out.
 *
 * The app's own origins are always allowed, even when they are private: in
 * development the tenant is `localhost` and its API is `localhost` on another port,
 * and refusing them would be refusing the harness itself.
 */
export const isAllowedRequest = (
  url: string,
  ownOrigins: (string | undefined)[]
): boolean => {
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return false;
  }

  const own = ownOrigins.map(originOf).filter((origin) => origin !== null);
  if (own.length === 0) return false;
  if (own.includes(target.origin)) return true;
  // The draft bundle and anything the app inlines.
  if (target.protocol === "blob:" || target.protocol === "data:") return true;
  if (target.protocol !== "http:" && target.protocol !== "https:") return false;

  return !isPrivateHost(target.hostname);
};
