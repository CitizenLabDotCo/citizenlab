import { Locale } from '@citizenlab/cl2-component-library';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { includes } from 'lodash-es';
import { locales } from 'containers/App/constants';

export const getLocale = (): Locale => 'en-GB';

const LocaleSubject: BehaviorSubject<Locale> = new BehaviorSubject(null as any);
const $locale = LocaleSubject.pipe(
  distinctUntilChanged(),
  filter((locale) => locale !== null)
);

LocaleSubject.next('en');

export const localeStream = () => ({
  observable: $locale,
});

export function getUrlLocale(pathname: string): string | null {
  const firstUrlSegment = pathname.replace(/^\/|\/$/g, '').split('/')[0];
  const isLocale = includes(locales, firstUrlSegment);
  return isLocale ? firstUrlSegment : null;
}

export function setPathnameLocale(
  pathname: string,
  locale: Locale,
  search?: string
) {
  return `/${locale}${pathname}${search || ''}`;
}

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

export function removeUrlLocale(pathname: string): string {
  const urlSegments = pathname.replace(/^\/|\/$/g, '').split('/');
  if (includes(locales, urlSegments[0])) {
    urlSegments[0] = '';
  }
  return urlSegments.length === 1 ? '/' : urlSegments.join('/');
}
