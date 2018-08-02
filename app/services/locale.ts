import { BehaviorSubject } from 'rxjs';
import { first, map, distinctUntilChanged, filter } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { includes, isEqual } from 'lodash';
import { currentTenantStream } from 'services/tenant';
import { authUserStream } from 'services/auth';
import platformLocales from 'platformLocales';
import { Locale } from 'typings';

const LocaleSubject: BehaviorSubject<Locale> = new BehaviorSubject(null as any);
const $tenantLocales = currentTenantStream().observable.pipe(
  map(tenant => tenant.data.attributes.settings.core.locales),
  distinctUntilChanged((prev, next) => !isEqual(prev, next))
);
const $authUser = authUserStream().observable.pipe(
  distinctUntilChanged()
);
const $locale = LocaleSubject.pipe(
  distinctUntilChanged(),
  filter((locale) => locale !== null)
);

$locale.subscribe((locale) => {
  const urlLocale = getUrlLocale(location.pathname);
  let newLocalizedUrl = `/${locale}${location.pathname}${location.search}`;

  if (urlLocale) {
    const matchRegexp = new RegExp(`^\/(${urlLocale})\/`);
    newLocalizedUrl = `${location.pathname.replace(matchRegexp, `/${locale}/`)}${location.search}`;
  }

  window.history.replaceState({ path: newLocalizedUrl }, '', newLocalizedUrl);
});

combineLatest(
  $authUser,
  $tenantLocales
).subscribe(([user, tenantLocales]) => {
  const urlLocale = getUrlLocale(location.pathname);
  const urlSegments = location.pathname.replace(/^\/|\/$/g, '').split('/');
  const lastUrlSegment = urlSegments[urlSegments.length - 1];
  const userLocale = (user && user.data.attributes.locale && includes(tenantLocales, user.data.attributes.locale) ? user.data.attributes.locale : null);

  if (lastUrlSegment === 'sign-in' && userLocale) {
    LocaleSubject.next(userLocale);
  } else if (includes(tenantLocales, urlLocale)) {
    LocaleSubject.next(urlLocale as Locale);
  } else if (userLocale) {
    LocaleSubject.next(userLocale);
  } else if (tenantLocales && tenantLocales.length > 0) {
    LocaleSubject.next(tenantLocales[0]);
  }
});

export function getUrlLocale(pathname: string) {
  const localeRegexp = /^\/([a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?)\//;
  const matches = localeRegexp.exec(pathname);
  return ((matches && includes(Object.keys(platformLocales), matches[1])) ? matches[1] : null);
}

export function updateLocale(locale: Locale) {
  $tenantLocales.pipe(
    first()
  ).subscribe((tenantLocales) => {
    if (includes(tenantLocales, locale)) {
      LocaleSubject.next(locale);
    }
  });
}

export function localeStream() {
  return {
    observable: $locale
  };
}
