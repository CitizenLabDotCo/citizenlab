// Every locale-related functions and utilitaries should be implemented here.

/*
  Locale management outline:

  The locale stream is the source of truth, not the url's locale.
    - all links are dynamically updated to inlude the freshest value of the stream
    - changes to the stream change the urls locale

  Preference for setting currentLocale stream (depends on ordering defined in 1):
    - if logged in, the locale in the authUser object
    - else, the locale in the cookie if it exists
    - else, the url's locale
    - falls back to the first tenant locale

  The locale stream receives a new value :
    - when authUser changes : on log in, or when the locale field of the user object has changed.
    - when the tenant changes its supported locales : on first load, or on real change
      cf 1. Setting locale depending on user, cookie and tenant

    - when updateLocale has been called : on using the langage dropdown.
      (does not go through 1, so ignores the source of truth in order to change it)
      If logged in his will update the authUser with new locale
      else, it will push the new locale to the stream and set a cookie to remember this choice.
      cf 2. Pushing a locale to the stream

  When the stream has received a new value, it updates the url accordingly.
    cf 3. Updating the url with newly received locale
*/

// -----------------------------------------------------------------------------
// imports and definitions
import { BehaviorSubject, combineLatest } from 'rxjs';
import { first, map, distinctUntilChanged, filter } from 'rxjs/operators';
import { includes, isEqual, get } from 'lodash-es';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { authUserStream } from 'services/auth';
import { updateUser } from 'services/users';
import { Locale } from 'typings';
import { locales } from 'containers/App/constants';
import { setCookieLocale, getCookieLocale } from 'utils/localeCookie';

const LocaleSubject: BehaviorSubject<Locale> = new BehaviorSubject(null as any);
const $tenantLocales = currentAppConfigurationStream().observable.pipe(
  map((tenant) => get(tenant, 'data.attributes.settings.core.locales')),
  distinctUntilChanged((prev, next) => !isEqual(prev, next))
);
const $authUser = authUserStream().observable.pipe(distinctUntilChanged());
const $locale = LocaleSubject.pipe(
  distinctUntilChanged(),
  filter((locale) => locale !== null)
);

// -----------------------------------------------------------------------------
// main functionalities - 3 parts

// 1. Setting locale depending on user, cookie and tenant
combineLatest($authUser, $tenantLocales).subscribe(([user, tenantLocales]) => {
  // gets the current user's locale of choice if they both exist
  // and checks if it's a possible locale to have on this tenant
  const userLocale: Locale | null =
    user &&
    user.data.attributes.locale &&
    includes(tenantLocales, user.data.attributes.locale)
      ? user.data.attributes.locale
      : null;

  // gets the locale in the cookie
  const cookieLocale = getCookieLocale();
  // and checks if it's a possible locale to have on this tenant
  // the tenant only allows Locales so we can cast the Locale type safely here
  const safeCookieLocale: Locale | false =
    includes(tenantLocales, cookieLocale) && (cookieLocale as Locale);

  // gets the first part of the url if it resembles a locale enough (cf getUrlLocale's comments)
  const urlLocale: string | null = getUrlLocale(location.pathname);
  // and checks if it's a possible locale to have on this tenant
  // the tenant only allows Locales so we can cast the Locale type safely here
  const safeUrlLocale: Locale | false =
    includes(tenantLocales, urlLocale) && (urlLocale as Locale);

  // - use userLocale if it's valid and supported
  // - else use cookieLocale if it's valid and supported
  // - else, use urlLocale if it's valid and supported
  // - fall back to the first tenant locale
  if (userLocale) {
    LocaleSubject.next(userLocale);
  } else if (safeCookieLocale) {
    LocaleSubject.next(safeCookieLocale);
  } else if (safeUrlLocale) {
    LocaleSubject.next(safeUrlLocale);
  } else if (tenantLocales && tenantLocales.length > 0) {
    LocaleSubject.next(tenantLocales[0]);
  }
});

// 2. Pushing a locale to the stream

/*  @param locale : the locale you want to set as the current locale
 *   !! only used in the LanguageSelector component. Chances are it should only be used there.
 *   Checks the locale is supported by this tenant before tying to set the new locale
 */
export function updateLocale(locale: Locale) {
  // "gets" the tenants locale and authUser
  combineLatest(
    $tenantLocales.pipe(first()),
    $authUser.pipe(first())
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
        // if there's no auth user, set a cookie to remember this choice
        setCookieLocale(locale);
        // and push the locale to the stream, which will trigger
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
  const isLocale = includes(locales, firstUrlSegment);
  return isLocale ? firstUrlSegment : null;
}

/*  @param pathname : the pathname you want to extract the locale from
 *   removes the first part of the url if it resembles a locale enough (cf constants.ts: locales)
 *   returns the remaining string
 *   is insenitive to additional/missing '/' at pathname start and end
 */
export function removeUrlLocale(pathname: string): string {
  // strips beginning and ending '/', breaks down the string at '/'
  const urlSegments = pathname.replace(/^\/|\/$/g, '').split('/');
  // if first segment resembles a locale enough replace it with an empty string
  if (includes(locales, urlSegments[0])) {
    urlSegments[0] = '';
  }
  return urlSegments.length === 1 ? '/' : urlSegments.join('/');
}

/*  @param: locale : the locale you want to add in front of current pathname
 *   prerequisite NO LOCALE : the current pathname should not already include a locale
 *   !! this function should not leave this component (no importing it except for tests)
 */
function setUrlLocale(locale: Locale): void {
  const newLocalizedUrl = setPathnameLocale(
    location.pathname,
    locale,
    location.search
  );
  window.history.replaceState({ path: newLocalizedUrl }, '', newLocalizedUrl);
}

/*  @param pathname: a string representing a pathname, without a starting locale. pathname must tart with /, and final / will not be moved
 *   @param locale: the locale you want to add to the pathname
 *   @param search: optional string representing query parameters, starting with '?'
 *
 *   @returns a valid pathname starting with a locale
 */
export function setPathnameLocale(
  pathname: string,
  locale: Locale,
  search?: string
): string {
  return `/${locale}${pathname}${search || ''}`;
}

/*  @param: locale : the locale you want to replace the one in the current pathname with
 *   prerequisite : the current pathname includes one locale, and the url starts with it.
 *   handles well starting and/or finishing and/or not starting and/or not finishing with '/'
 *   !! this function overrides the browsers url and should not leave this component
 *   (no importing it except for tests)
 */
function replaceUrlLocale(locale: Locale) {
  const newLocalizedUrl = replacePathnameLocale(
    location.pathname,
    locale,
    location.search
  );
  // replaces current location with updated url
  window.history.replaceState({ path: newLocalizedUrl }, '', newLocalizedUrl);
}

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
  locale: Locale,
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

// -----------------------------------------------------------------------------
// A function that returns the stream defined here
export function localeStream() {
  return {
    observable: $locale,
  };
}
