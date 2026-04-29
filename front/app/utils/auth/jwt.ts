import { get, set, remove, CookieAttributes } from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

import { HighestRole } from 'api/users/types';

import { SECURE_COOKIE } from '../cookie';

const COOKIE_NAME = 'cl2_jwt';

export interface IDecodedJwt {
  sub: string;
  highest_role: HighestRole;
  exp: number;
  provider?: string;
  logout_supported?: boolean;
}

export function getJwt() {
  try {
    const jwt = get(COOKIE_NAME);

    if (!jwt || jwt === 'undefined') {
      removeJwt();
      return null;
    }

    return jwt;
  } catch (error) {
    return null;
  }
}

export function setJwt(
  jwt: string,
  rememberMe: boolean,
  tokenLifetime?: number
) {
  const attrs = {
    secure: SECURE_COOKIE,
    sameSite: 'strict',
  } as CookieAttributes;
  if (rememberMe) {
    attrs.expires = tokenLifetime; // If omitted, the cookie becomes a session cookie. Fore more info, check https://stackoverflow.com/a/36421888
  }
  set(COOKIE_NAME, jwt, attrs);
}

export function removeJwt() {
  remove(COOKIE_NAME);
}

export function decode(jwt) {
  return jwtDecode<IDecodedJwt>(jwt);
}

export function getSecondsUntilExpiry(): number | null {
  const jwt = getJwt();
  if (!jwt) return null;
  try {
    const decoded = decode(jwt);
    return decoded.exp - Math.floor(Date.now() / 1000);
  } catch {
    return null;
  }
}
