import Cookies from 'js-cookie';

// The API keeps the auth token in an HttpOnly cookie, which this code can't read.
// Next to it, the API sets this cookie, with the same expiry, so we can tell right
// away whether the user is signed in, without asking the API. It is only a hint:
// the API doesn't check whether the token is still valid when it sets this cookie,
// and never reads it.
const SIGNED_IN_COOKIE = 'cl2_signed_in';

export const hasSignedInCookie = () => {
  try {
    return Cookies.get(SIGNED_IN_COOKIE) !== undefined;
  } catch {
    return false;
  }
};
