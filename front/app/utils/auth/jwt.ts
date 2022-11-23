import { get, set, remove, CookieAttributes } from 'js-cookie';
import jwtDecode from 'jwt-decode';
import { SECURE_COOKIE } from '../cookie';

const COOKIE_NAME = 'cl2_jwt';

interface IDecodedJwt {
  sub: string;
  provider?: string;
  logout_supported?: boolean;
}

export function getJwt() {
  try {
    return get(COOKIE_NAME);
  } catch (error) {
    return null;
  }
}

export function setJwt(jwt: string, rememberMe: boolean, expires?: number) {
  const attrs = { secure: SECURE_COOKIE } as CookieAttributes;
  if (rememberMe) {
    attrs.expires = expires; // If omitted, the cookie becomes a session cookie
  }
  set(COOKIE_NAME, jwt, attrs);
}

export function removeJwt() {
  remove(COOKIE_NAME);
}

export function decode(jwt) {
  return jwtDecode<IDecodedJwt>(jwt);
}
