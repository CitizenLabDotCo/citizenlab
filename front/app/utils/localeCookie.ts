import { get, set } from 'js-cookie';
import { Locale } from 'typings';
import { SECURE_COOKIE } from './cookie';

const COOKIE_NAME = 'cl2_locale';

export function getCookieLocale() {
  try {
    return get(COOKIE_NAME);
  } catch (error) {
    return null;
  }
}

export function setCookieLocale(locale: Locale) {
  set(COOKIE_NAME, locale, { expires: 60, secure: SECURE_COOKIE });
}
