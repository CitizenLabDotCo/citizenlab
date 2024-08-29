// eslint-disable-next-line no-restricted-imports
import { includes } from 'lodash-es';

import { locales } from 'containers/App/constants';

/*  @param location : the pathname you want to extract the locale from
 *   gets the first part of the url if it resembles a locale enough (cf constants.ts: locales)
 *   returns null or a string in locales (cf constants.ts)
 *   is insenitive to additional/missing '/' at pathname start and end
 */
export function getUrlLocale(pathname: string): string | null {
  // strips beginning and ending '/', breaks down the string at '/'
  const firstUrlSegment = pathname.replace(/^\/|\/$/g, '').split('/')[0];
  // check first items appartenance to predefined locales obj
  const isLocale = includes(locales, firstUrlSegment);
  return isLocale && firstUrlSegment ? firstUrlSegment : null;
}
