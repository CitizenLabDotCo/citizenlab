import { get, set, remove } from 'js-cookie';
import jwtDecode from 'jwt-decode';

const COOKIE_NAME = 'cl2_jwt';
const SECUIRE_COOKIE =
  process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test';

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
  set(COOKIE_NAME, jwt, { expires: 60, secure: SECUIRE_COOKIE });
}

export function removeJwt() {
  remove(COOKIE_NAME);
}

export function decode(jwt) {
  return jwtDecode<IDecodedJwt>(jwt);
}
