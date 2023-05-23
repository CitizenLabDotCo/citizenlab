import { get, set } from 'js-cookie';
import { SECURE_COOKIE } from '../../utils/cookie';

const COOKIE_NAME = 'cl2_anonymous_confirmation';

export function getCookieAnonymousConfirmation(): string | undefined {
  try {
    return get(COOKIE_NAME);
  } catch (error) {
    return undefined;
  }
}

export function setCookieAnonymousConfirmation() {
  set(COOKIE_NAME, 'Prior anonymous confirmation', {
    expires: 60,
    secure: SECURE_COOKIE,
  });
}
