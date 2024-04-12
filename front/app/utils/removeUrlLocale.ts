import { includes } from 'lodash-es';

import { locales } from 'containers/App/constants';
/*  @param pathname : the pathname you want to extract the locale from
 *   removes the first part of the url if it resembles a locale enough (cf constants.ts: locales)
 *   returns the remaining string
 *   is insenitive to additional/missing '/' at pathname start and end
 */
export function removeUrlLocale(pathname: string): string {
  // strips beginning and ending '/', breaks down the string at '/'
  const urlSegments = pathname.replace(/^\/|\/$/g, '').split('/');
  // if first segment resembles a locale enough replace it with an empty string
  if (includes(locales, urlSegments[0])) {
    urlSegments[0] = '';
  }
  return urlSegments.length === 1 ? '/' : urlSegments.join('/');
}
