import { get, set, CookieAttributes } from 'js-cookie';

import { SECURE_COOKIE } from '../cookie';

const COOKIE_NAME = 'cl2_jwt';

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
