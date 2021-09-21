import { get, set, remove } from 'js-cookie';
import { Locale } from 'typings';

const COOKIE_NAME = 'cl2_locale';

export function getCookieLocale() {
  try {
    return get(COOKIE_NAME);
  } catch (error) {
    return null;
  }
}

export function setCookieLocale(locale: Locale) {
  set(COOKIE_NAME, locale, { expires: 60 });
}

export function removeCookieLocale() {
  remove(COOKIE_NAME, { expires: 60 });
}
