import { BehaviorSubject } from 'rxjs';
import { first, map, distinctUntilChanged, filter } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import includes from 'lodash/includes';
import { currentTenantStream } from 'services/tenant';
import { authUserStream } from 'services/auth';
import { updateUser } from 'services/users';
import platformLocales from 'platformLocales';
import { Locale } from 'typings';

const LocaleSubject: BehaviorSubject<Locale> = new BehaviorSubject(null as any);
const $tenant = currentTenantStream().observable;
const $authUser = authUserStream().observable;
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
  $tenant.pipe(
    map(tenant => tenant.data.attributes.settings.core.locales)
  )
).subscribe(([user, tenantLocales]) => {
  const urlLocale = getUrlLocale(location.pathname);

  if (user && user.data.attributes.locale && includes(tenantLocales, user.data.attributes.locale)) {
    LocaleSubject.next(user.data.attributes.locale);
  } else if (includes(tenantLocales, urlLocale)) {
    LocaleSubject.next(urlLocale as Locale);
  } else if (tenantLocales && tenantLocales.length > 0) {
    LocaleSubject.next(tenantLocales[0]);
  }
});

export function getUrlLocale(pathname: string): string | null {
  const localeRegexp = /^\/([a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?)\//;
  const matches = localeRegexp.exec(pathname);
  return (matches && includes(Object.keys(platformLocales), matches[1])) ? matches[1] : null;
}

export function updateLocale(newUserLocale: Locale) {
  combineLatest(
    $authUser,
    $tenant.pipe(
      map(tenant => tenant.data.attributes.settings.core.locales)
    )
  ).pipe(
    first()
  ).subscribe(([authUser, tenantLocales]) => {
    if (includes(tenantLocales, newUserLocale)) {
      if (authUser) {
        updateUser(authUser.data.id, { locale: newUserLocale });
      }

      LocaleSubject.next(newUserLocale);
    }
  });
}

export function localeStream() {
  return {
    observable: $locale
  };
}
