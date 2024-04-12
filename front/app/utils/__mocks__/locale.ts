import { includes } from 'lodash-es';
import { SupportedLocale } from 'typings';

import { locales } from 'containers/App/constants';

export const getLocale = (): SupportedLocale => 'en-GB';

export function setPathnameLocale(
  pathname: string,
  locale: SupportedLocale,
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
