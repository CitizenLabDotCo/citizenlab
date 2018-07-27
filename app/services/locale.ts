import { BehaviorSubject } from 'rxjs';
import { switchMap, first, map, distinctUntilChanged } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import includes from 'lodash/includes';
import { currentTenantStream } from 'services/tenant';
import { authUserStream } from 'services/auth';
import { updateUser } from 'services/users';
import { Locale } from 'typings';
import platformLocales from 'platformLocales';
// tslint:disable-next-line:no-vanilla-routing
// import { browserHistory } from 'react-router';
// import updateLocationDescriptor from 'utils/cl-router/updateLocationDescriptor';
import clHistory from 'utils/cl-router/history';

const urlLocale = getUrlLocale(location.pathname);
const LocaleSubject = new BehaviorSubject((urlLocale ? urlLocale : 'en') as Locale);
const $locale = LocaleSubject.pipe(distinctUntilChanged());
const $tenant = currentTenantStream().observable;
const $authUser = authUserStream().observable;

// Get locale from URL
export function getUrlLocale(pathname: string): string | null {
  const localeRegexp = /^\/([a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?)\//;
  const matches = localeRegexp.exec(pathname);
  return (matches && includes(Object.keys(platformLocales), matches[1])) ? matches[1] : null;
}

$locale.subscribe((locale) => {
  // Save the selection in localStorage as an override
  localStorage.setItem('cl2-locale', locale);

  const urlLocale = location.pathname && getUrlLocale(location.pathname);
  const urlLocaleIsValid = includes(Object.keys(platformLocales), urlLocale);

  console.log('-----');
  console.log('locale.ts');
  console.log('locale: ' + locale);
  console.log('urlLocale: ' + urlLocale);
  console.log('url: ' + location.pathname);
  console.log('urlLocaleIsValid: ' + urlLocaleIsValid);
  console.log('-----');

  if (!urlLocale || !urlLocaleIsValid || urlLocale !== locale) {
    let localizedUrl = `/${locale}${location.pathname}${location.search}`;

    if (urlLocale) {
      const matchRegexp = new RegExp(`^\/(${urlLocale})\/`);
      localizedUrl = `${location.pathname.replace(matchRegexp, `/${locale}/`)}${location.search}`;
    }

    window.history.replaceState({ path: localizedUrl }, '', localizedUrl);
  }
});

// Update the current user preferred locale if there's one logged in
$locale.pipe(
  switchMap((locale) => $authUser.pipe(
    first(),
    map(user => ({ user, locale }))
  ))
).subscribe(({ user, locale }) => {
  if (user && user.data.id && locale !== user.data.attributes.locale) {
    updateUser(user.data.id, { locale });
  }
});

// Push either the user-selected or the first tenant locale
combineLatest(
  $authUser,
  $tenant.pipe(map(tenant => tenant.data.attributes.settings.core.locales))
).subscribe(([user, tenantLocales]) => {
  if (user && user.data.attributes.locale && includes(tenantLocales, user.data.attributes.locale)) {
    LocaleSubject.next(user.data.attributes.locale);
  } else if (tenantLocales && tenantLocales.length > 0) {
    LocaleSubject.next(tenantLocales[0]);
  }
});

// Push a new value down the stream if it belongs in the Tenant Locales
export function updateLocale(value: Locale) {
  $tenant.pipe(first()).subscribe((tenant) => {
    const tenantLocales = tenant.data.attributes.settings.core.locales;

    if (includes(tenantLocales, value)) {
      // Only update the value with a locale accepted by the tenant
      LocaleSubject.next(value);
    }
  });
}

export function localeStream() {
  return { observable: $locale };
}
