import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

import { HighestRole } from 'api/users/types';

import { SECURE_COOKIE } from '../cookie';

import {
  forgetJwt,
  rememberJwt,
  reportUnexpectedJwtLoss,
} from './reportJwtLoss';

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
    const jwt = Cookies.get(COOKIE_NAME);

    if (!jwt || jwt === 'undefined') {
      // Before removeJwt(), which clears the record this check relies on.
      reportUnexpectedJwtLoss();
      removeJwt();
      return null;
    }

    // Seeds the record on page loads that reuse an existing session, where
    // setJwt is never called.
    rememberJwt(jwt);
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
  } as Cookies.CookieAttributes;
  if (rememberMe) {
    attrs.expires = tokenLifetime; // If omitted, the cookie becomes a session cookie. Fore more info, check https://stackoverflow.com/a/36421888
  }
  Cookies.set(COOKIE_NAME, jwt, attrs);
  rememberJwt(jwt);
}

export function removeJwt() {
  forgetJwt();
  Cookies.remove(COOKIE_NAME);
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
