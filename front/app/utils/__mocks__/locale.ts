import { includes } from 'lodash-es';
import { Locale } from 'typings';

import { locales } from 'containers/App/constants';

export const getLocale = (): Locale => 'en-GB';

export function setPathnameLocale(
  pathname: string,
  locale: Locale,
  search?: string
) {
  return `/${locale}${pathname}${search || ''}`;
}

export function removeUrlLocale(pathname: string): string {
  const urlSegments = pathname.replace(/^\/|\/$/g, '').split('/');
  if (includes(locales, urlSegments[0])) {
    urlSegments[0] = '';
  }
  return urlSegments.length === 1 ? '/' : urlSegments.join('/');
}

export function hasTextInSpecifiedLocale() {
  return true;
}
