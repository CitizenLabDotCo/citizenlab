// Every locale-related functions and utilitaries should be implemented here.

/*
  Locale management outline:

  source of truth (depends on ordering defined in 1):
    - if logged in, the locale in the authUser object
    - else, the url is the source of truth
    - falls back to the first tenant locale

  ! This source of truth order means the only way to change an authenticated users locale
  is by updating said user.

  The locale stream receives a new value :
    - when authUser changes : on log in, or when the locale field of the user object has changed.
    - when the tenant changes its supported locales : on first load, or on real change
      cf 1. Setting locale depending on user and tenant

    - when updateLocale has been called : on using the langage dropdown.
      (does not go through 1, so ignores the source of truth in order to change it)
      cf 2. Pushing a locale to the stream

      The source of truth order implies that if you call this with an autenticated user, it will :
      1. change the locale in the stream
      2. change the urlLocale
      3. --- because of the weird bug --- reload
      4. pick the locale still in the authUser.

      If we were to fix the weird bug it would whange the displayed locale but not update the users locale
      if the user info were to change it would go back to previous locale
      and on reload/leaving and coming back, locale would be wrong.

  When the stream has received a new value, it updates the url accordingly.
    cf 3. Updating the url with newly received locale
*/

// -----------------------------------------------------------------------------
// imports and definitions
import { BehaviorSubject, combineLatest } from 'rxjs';
import { first, map, distinctUntilChanged, filter } from 'rxjs/operators';
import { includes, isEqual } from 'lodash-es';
import { currentTenantStream } from 'services/tenant';
import { authUserStream } from 'services/auth';
import { Locale } from 'typings';
import { locales } from 'containers/App/constants';

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

// -----------------------------------------------------------------------------
// main functionalities - 3 parts

// 1 . Setting locale depending on user and tenant
combineLatest(
  $authUser,
  $tenantLocales
).subscribe(([user, tenantLocales]) => {

  // gets the first part of the url if it resembles a locale enough
  const urlLocale: string | null = getUrlLocale(location.pathname);
  // and checks if it's a possible locale to have on this tenant
  // the tenant only allows Locales so we can cast safely here
  const safeUrlLocale: Locale | false = includes(tenantLocales, urlLocale) && (urlLocale as Locale);

  // gets the current user's locale of choice if they both exist
  // and checks if it's a possible locale to have on this tenant
  const userLocale: Locale | null = (user
    && user.data.attributes.locale
    && includes(tenantLocales, user.data.attributes.locale) ? user.data.attributes.locale : null);

  // - if logged in, use locale in the authUser object if it's valid and supported
  // - else, the url is the source of truth if it containes a valid and supported locale
  // - falls back to the first tenant locale
  if (userLocale) {
    LocaleSubject.next(userLocale);
  } else if (safeUrlLocale) {
    LocaleSubject.next(safeUrlLocale);
  } else if (tenantLocales && tenantLocales.length > 0) {
    LocaleSubject.next(tenantLocales[0]);
  }
});

// 2. Pushing a locale to the stream

/*  @param locale : the locale you want to set as the current locale
*
*   prerequisite UNAUTH USER : will only change the locale for an unauth user,
*   the locale source of truth for authenticated users is the location in the
*   authUser object, it has to be changed by updating the user.
*
*   !! only used in the LanguageSelector component. Chances are it should only be used there.
*
*   checks the locale is supported by this tenant before pushing new locale
*/
export function updateLocale(locale: Locale) {
  $tenantLocales.pipe(
    first()
  ).subscribe((tenantLocales) => {
    if (includes(tenantLocales, locale)) {
      LocaleSubject.next(locale);
    }
  });
}

// 3. Updating the url with newly received locale
$locale.subscribe((locale) => {
  // when receiving a new locale...
  // (the default locale when loading as unsigned,
  // of a new locale whosen via the UI)

  // checks if the current location contains a locale
  const urlLocale = getUrlLocale(location.pathname);

  // if not, set the newly received locale to the current (locale-less) pathname
  // should only happen when arriving to the platform following a locale-less link
  if (!urlLocale) {
    setUrlLocale(locale);

  // if there is a locale different than the one received,
  // replace it in the pathname with the newly received locale
  // should happen only when picking a new locale with the picker
  } else if (urlLocale && urlLocale !== locale) {
    replaceUrlLocale(locale);
  }
});

// -----------------------------------------------------------------------------
// helper functions

/*  @param location : the pathname you want to extract the locale from
*   gets the first part of the url if it resables a locale enough (if it's in the locales constant obj)
*   returns null or a string in locales (cf constants.ts)
*/
export function getUrlLocale(pathname: string): string | null {
  const firstUrlSegment = pathname.replace(/^\/|\/$/g, '').split('/')[0];
  const isLocale = (includes(locales, firstUrlSegment));
  return (isLocale ? firstUrlSegment : null);
}

/*  @param: locale : the locale you want to add in front of current pathname
*   prerequisite : the current pathname should not already include a locale !
*   !! this function should not leave this component (no importing it except for tests)
*/
function setUrlLocale(locale: Locale): void {
  const newLocalizedUrl = `/${locale}${location.pathname}${location.search}`;
  window.history.replaceState({ path: newLocalizedUrl }, '', newLocalizedUrl);
}

/*  @param: locale : the locale you want to replace the one in the current pathname with
*   prerequisite : the current pathname includes one locale, and the url starts with it.
*   handles well starting and/or finishing and/or no starting and/or no finish '/'
*   !! this function should not leave this component (no importing it exept for tests)
*/
function replaceUrlLocale(locale: Locale) {
  // strips beginning and ending '/', breaks down the string at '/'
  const urlSegments = location.pathname.replace(/^\/|\/$/g, '').split('/');
  // replaces first segment (the old url locale) with the url we want
  urlSegments[0] = locale;
  // puts back the pieces together
  const newPathname = urlSegments.join('/');
  // adds a first '/' and other query arguments if any
  const newLocalizedUrl = `/${newPathname}${location.search}`;
  // replaces current location with updated url
  window.history.replaceState({ path: newLocalizedUrl }, '', newLocalizedUrl);
}

// -----------------------------------------------------------------------------
// A function that returns the stream defined here
export function localeStream() {
  return {
    observable: $locale
  };
}
