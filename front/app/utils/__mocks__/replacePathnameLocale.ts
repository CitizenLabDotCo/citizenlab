import { Locale } from 'typings';

export function replacePathnameLocale(
  pathname: string,
  locale: Locale,
  search?: string
) {
  const urlSegments = pathname.replace(/^\/|\/$/g, '').split('/');
  urlSegments[0] = locale;
  const newPathname = urlSegments.join('/');
  return urlSegments.length === 1
    ? `/${newPathname}/`
    : `/${newPathname}${search || ''}`;
}
