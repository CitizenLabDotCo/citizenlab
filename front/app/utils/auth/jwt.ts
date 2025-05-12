import { get, set, remove, CookieAttributes } from 'js-cookie';
import jwtDecode from 'jwt-decode';

import { SECURE_COOKIE } from '../cookie';

const COOKIE_NAME = 'cl2_jwt';

export interface IDecodedJwt {
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
