// Every locale-related functions and utilitaries should be implemented here.

/*
  Locale management outline:

  source of truth for setting currentLocale stream (depends on ordering defined in 1):
    - if logged in, the locale in the authUser object
    - else, the url's locale
    - falls back to the first tenant locale

  The locale stream receives a new value :
    - when authUser changes : on log in, or when the locale field of the user object has changed.
    - when the tenant changes its supported locales : on first load, or on real change
      cf 1. Setting locale depending on user and tenant

    - when updateLocale has been called : on using the langage dropdown.
      (does not go through 1, so ignores the source of truth in order to change it)
      This will update the authUser with new locale if logged in, or push the new locale to the
      stream to change an unauth users locale.
      // Possible improvement: if we want unauth user to keep their locale, we could write it to a cookie
      cf 2. Pushing a locale to the stream

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
import { updateUser } from 'services/users';
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

  // gets the first part of the url if it resembles a locale enough (cf getUrlLocale's comments)
  const urlLocale: string | null = getUrlLocale(location.pathname);
  // and checks if it's a possible locale to have on this tenant
  // the tenant only allows Locales so we can cast the Locale type safely here
  const safeUrlLocale: Locale | false = includes(tenantLocales, urlLocale) && (urlLocale as Locale);

  // gets the current user's locale of choice if they both exist
  // and checks if it's a possible locale to have on this tenant
  const userLocale: Locale | null = (
    user
    && user.data.attributes.locale
    && includes(tenantLocales, user.data.attributes.locale) ? user.data.attributes.locale : null);

  // - use userLocale if it's valid and supported
  // - else, use urlLocale if it's valid and supported
  // - fall back to the first tenant locale
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
*   !! only used in the LanguageSelector component. Chances are it should only be used there.
*
*   Checks the locale is supported by this tenant before tying to set the new locale
*
*/
export function updateLocale(locale: Locale) {
  // "gets" the tenants locale and authUser
  combineLatest(
    $tenantLocales.pipe(
      first()
    ),
    $authUser.pipe(
      first()
    )
  ).subscribe(([tenantLocales, authUser]) => {
    // if the locale is supported on this tenant
    if (includes(tenantLocales, locale)) {
      // if there is an authenticated user
      if (authUser) {
        // updates the users locale preference,
        // which will trigger 1 that will set the locale to the locale stream
        // which will trigger 3 that will change the url accordingly
        updateUser(authUser.data.id, { locale });
      } else {
        // if there's no auth user, push the locale to the stream, which will trigger
        // 3 which will change the url accordingly
        LocaleSubject.next(locale);
      }
    }
  });
}

// 3. Updating the url with newly received locale
$locale.subscribe((locale) => {
  // when receiving a new locale...

  // gets the first part of the url if it resembles a locale enough (cf getUrlLocale's comments)
  const urlLocale = getUrlLocale(location.pathname);

  // if not, set the newly received locale to the current (locale-less) pathname
  // (should only happen when arriving to the platform following a locale-less link)
  if (!urlLocale) {
    setUrlLocale(locale);

  // if there is a locale and it's different than the one received,
  // replace it in the pathname with the newly received locale
  } else if (urlLocale && urlLocale !== locale) {
    replaceUrlLocale(locale);
  }
});

// -----------------------------------------------------------------------------
// helper functions

/*  @param location : the pathname you want to extract the locale from
*   gets the first part of the url if it resembles a locale enough (cf constants.ts: locales)
*   returns null or a string in locales (cf constants.ts)
*   is insenitive to additional/missing '/' at pathname start and end
*/
export function getUrlLocale(pathname: string): string | null {
  // strips beginning and ending '/', breaks down the string at '/'
  const firstUrlSegment = pathname.replace(/^\/|\/$/g, '').split('/')[0];
  // check first items appartenance to predefined locales obj
  const isLocale = (includes(locales, firstUrlSegment));
  return (isLocale ? firstUrlSegment : null);
}

/*  @param: locale : the locale you want to add in front of current pathname
*   prerequisite NO LOCALE : the current pathname should not already include a locale
*   !! this function should not leave this component (no importing it except for tests)
*/
function setUrlLocale(locale: Locale): void {
  const newLocalizedUrl = `/${locale}${location.pathname}${location.search}`;
  window.history.replaceState({ path: newLocalizedUrl }, '', newLocalizedUrl);
}

/*  @param: locale : the locale you want to replace the one in the current pathname with
*   prerequisite : the current pathname includes one locale, and the url starts with it.
*   handles well starting and/or finishing and/or no starting and/or no finish '/'
*   !! this function should not leave this component (no importing it except for tests)
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
