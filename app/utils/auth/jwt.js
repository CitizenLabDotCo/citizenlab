export function getJwt() {
  try {
    return window.localStorage.getItem('jwt');
  } catch (err) {
    console.log("[DEBUG] err =", err); // eslint-disable-line
    return null;
  }
}

export function setJwt(jwt) {
  window.localStorage.setItem('jwt', jwt);
}

export function removeJwt(jwt) {
  window.localStorage.removeItem('jwt', jwt);
}
