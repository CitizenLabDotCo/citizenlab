import { get, set, remove } from 'js-cookie';
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

export function setJwt(jwt: string) {
  set(COOKIE_NAME, jwt, { expires: 60, secure: SECURE_COOKIE });
}

export function removeJwt() {
  remove(COOKIE_NAME, { expires: 60 });
}

export function decode(jwt) {
  return jwtDecode<IDecodedJwt>(jwt);
}
