import { get, remove } from 'js-cookie';
import jwtDecode from 'jwt-decode';

// NOTE: Cookie is always set by the backend
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

export function removeJwt() {
  remove(COOKIE_NAME);
}

export function decode(jwt) {
  return jwtDecode<IDecodedJwt>(jwt);
}
