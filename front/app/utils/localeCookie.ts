import Cookies from 'js-cookie';
import { Locale } from 'typings';

const COOKIE_NAME = 'cl2_locale';

export function getCookieLocale() {
  try {
    return Cookies.get(COOKIE_NAME);
  } catch (error) {
    return null;
  }
}

export function setCookieLocale(locale: Locale) {
  Cookies.set(COOKIE_NAME, locale, { expires: 60 });
}

export function removeCookieLocale() {
  Cookies.remove(COOKIE_NAME, { expires: 60 });
}
