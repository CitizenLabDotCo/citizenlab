import { SupportedLocale } from 'typings';
/*  @param pathname: a string representing a pathname, with a first part we want to replace
 *     starting and/or finishing and/or not starting and/or not finishing with '/'
 *     ie resembling (/|''){gottaGo}( /{aValidRoute} | (/|'') )
 *   @param locale: the locale you want to replace the one in the pathname with
 *   @param search: optional string representing query parameters, starting with '?'
 *
 *   @returns a valid pathname with the first part replaced by the locale parameter, without a dangling '/'
 */
export function replacePathnameLocale(
  pathname: string,
  locale: SupportedLocale,
  search?: string
) {
  // strips beginning and ending '/', breaks down the string at '/'
  const urlSegments = pathname.replace(/^\/|\/$/g, '').split('/');
  // replaces first segment (the old url locale) with the url we want
  urlSegments[0] = locale;
  // puts back the pieces together
  const newPathname = urlSegments.join('/');

  // if the route is '/'...
  return urlSegments.length === 1
    ? `/${newPathname}/` // adds a dangling '/' after the locale, for consistency
    : `/${newPathname}${search || ''}`; // else adds a first '/' and other query arguments if any
}
