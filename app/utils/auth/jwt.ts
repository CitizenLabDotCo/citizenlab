import Cookies from 'js-cookie';

const COOKIE_NAME = 'cl2_jwt';

export function getJwt() {
  try {
    return Cookies.get(COOKIE_NAME);
  } catch (error) {
    return null;
  }
}

export function setJwt(jwt: string) {
  Cookies.set(COOKIE_NAME, jwt, { expires: 60 });
}

export function removeJwt() {
  Cookies.remove(COOKIE_NAME, { expires: 60 });
}
