import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import includes from 'lodash/includes';
import { currentTenantStream } from 'services/tenant';
import { authUserStream } from 'services/auth';
import { updateUser } from 'services/users';
import { Locale } from 'typings';

const savedLocale = localStorage.getItem('cl2-locale') as Locale;
const LocaleSubject = new BehaviorSubject((savedLocale || 'en') as Locale);

LocaleSubject.subscribe((locale) => {
  // Save the selection in localStorage as an override
  localStorage.setItem('cl2-locale', locale);
});

// Update the current user preferred locale if there's one logged in
LocaleSubject.switchMap((locale) => {
  return authUserStream().observable.first().map((user) => ({ user, locale }));
}).subscribe(({ user, locale }) => {
  if (user && user.data.id && locale !== user.data.attributes.locale) {
    updateUser(user.data.id, { locale });
  }
});

// Push either the user-selected or the first tenant locale
Observable.combineLatest(
  authUserStream().observable,
  currentTenantStream().observable.map(tenant => tenant.data.attributes.settings.core.locales)
).subscribe(([user, tenantLocales]) => {
  if (user && user.data.attributes.locale && includes(tenantLocales, user.data.attributes.locale)) {
    LocaleSubject.next(user.data.attributes.locale);
  } else if (savedLocale && includes(tenantLocales, savedLocale)) {
    LocaleSubject.next(savedLocale);
  } else if (tenantLocales && tenantLocales.length > 0) {
    LocaleSubject.next(tenantLocales[0]);
  }
});

// Push a new value down the stream if it belongs in the Tenant Locales
export function updateLocale(value: Locale) {
  currentTenantStream().observable.first().subscribe((tenant) => {
    const tenantLocales = tenant.data.attributes.settings.core.locales;

    if (includes(tenantLocales, value)) {
      // Only update the value with a locale accepted by the tenant
      LocaleSubject.next(value);
    }
  });
}

export function localeStream() {
  return { observable: LocaleSubject };
}
