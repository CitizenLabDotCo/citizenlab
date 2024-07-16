import { SupportedLocale } from 'typings';
/*  @param pathname: a string representing a pathname, without a starting locale. pathname must tart with /, and final / will not be moved
 *   @param locale: the locale you want to add to the pathname
 *   @param search: optional string representing query parameters, starting with '?'
 *
 *   @returns a valid pathname starting with a locale
 */
export function setPathnameLocale(
  pathname: string,
  locale: SupportedLocale,
  search?: string
): string {
  return `/${locale}${pathname}${search || ''}`;
}
