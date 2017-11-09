import Cookies from 'js-cookie';
// export function getJwt() {
//   try {
//     return window.localStorage.getItem('jwt');
//   } catch (err) {
//     console.log("[DEBUG] err =", err); // eslint-disable-line
//     return null;
//   }
// }

// export function setJwt(jwt) {
//   window.localStorage.setItem('jwt', jwt);
// }

// export function removeJwt(jwt) {
//   window.localStorage.removeItem('jwt', jwt);
// }

const COOKIE_NAME = 'cl2_jwt';

export function getJwt() {
  try {
    return Cookies.get(COOKIE_NAME);
  } catch (err) {
    console.log("[DEBUG] err =", err); // eslint-disable-line
    return null;
  }
}

export function setJwt(jwt) {
  Cookies.set(COOKIE_NAME, jwt, { expires: 60 });
}

export function removeJwt() {
  Cookies.remove(COOKIE_NAME);
}
