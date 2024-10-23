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
import { includes, get } from 'lodash-es';
import { RouteType } from 'routes';
import { combineLatest } from 'rxjs';
import { first, map, distinctUntilChanged } from 'rxjs/operators';
import { SupportedLocale, Multiloc } from 'typings';

import appConfigurationStream from 'api/app_configuration/appConfigurationStream';
import { IAppConfiguration } from 'api/app_configuration/types';
import authUserStream from 'api/me/authUserStream';
import meKeys from 'api/me/keys';
import { updateUser } from 'api/users/useUpdateUser';

import { queryClient } from 'utils/cl-react-query/queryClient';
import clHistory from 'utils/cl-router/history';
import { setCookieLocale, getCookieLocale } from 'utils/localeCookie';

import { getUrlLocale } from './getUrlLocale';
import { $locale, LocaleSubject } from './localeStream';
import { replacePathnameLocale } from './replacePathnameLocale';
import { setPathnameLocale } from './setPathnameLocale';

const $tenantLocales = appConfigurationStream.pipe(
  map((tenant) => get(tenant, 'data.attributes.settings.core.locales'))
);
const $authUser = authUserStream.pipe(distinctUntilChanged());

// -----------------------------------------------------------------------------
// main functionalities - 3 parts

// 1. Setting locale depending on user, cookie and tenant
combineLatest([$authUser, $tenantLocales]).subscribe(
  ([user, tenantLocales]) => {
    // gets the current user's locale of choice if they both exist
    // and checks if it's a possible locale to have on this tenant
    const userLocale: SupportedLocale | null =
      user &&
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      user.data.attributes.locale &&
      includes(tenantLocales, user.data.attributes.locale)
        ? user.data.attributes.locale
        : null;

    // gets the locale in the cookie
    const cookieLocale = getCookieLocale();
    // and checks if it's a possible locale to have on this tenant
    // the tenant only allows Locales so we can cast the Locale type safely here
    const safeCookieLocale: SupportedLocale | false =
      includes(tenantLocales, cookieLocale) &&
      (cookieLocale as SupportedLocale);

    // gets the first part of the url if it resembles a locale enough (cf getUrlLocale's comments)
    const urlLocale: string | null = getUrlLocale(location.pathname);
    // and checks if it's a possible locale to have on this tenant
    // the tenant only allows Locales so we can cast the Locale type safely here
    const safeUrlLocale: SupportedLocale | false =
      includes(tenantLocales, urlLocale) && (urlLocale as SupportedLocale);

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
  }
);

// 2. Pushing a locale to the stream

/*  @param locale : the locale you want to set as the current locale
 *   !! only used in the LanguageSelector component. Chances are it should only be used there.
 *   Checks the locale is supported by this tenant before tying to set the new locale
 */
export function updateLocale(
  locale: SupportedLocale,
  appConfig: IAppConfiguration
) {
  const tenantLocales = appConfig.data.attributes.settings.core.locales;
  // "gets" the tenants locale and authUser
  $authUser.pipe(first()).subscribe(async (authUser) => {
    // if the locale is supported on this tenant
    if (includes(tenantLocales, locale)) {
      // if there is an authenticated user
      if (authUser) {
        // updates the users locale preference,
        // which will trigger 1 that will set the locale to the locale stream
        // which will trigger 3 that will change the url accordingly
        await updateUser({ userId: authUser.data.id, locale });
        queryClient.invalidateQueries({ queryKey: meKeys.all() });
      } else {
        // if there's no auth user, set a cookie to remember this choice
        setCookieLocale(locale);
        // and push the locale to the stream, which will trigger
        // 3 which will change the url accordingly
        LocaleSubject.next(locale as any);
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

/*  @param: locale : the locale you want to add in front of current pathname
 *   prerequisite NO LOCALE : the current pathname should not already include a locale
 *   !! this function should not leave this component (no importing it except for tests)
 */
function setUrlLocale(locale: SupportedLocale): void {
  const newLocalizedUrl = setPathnameLocale(
    location.pathname,
    locale,
    location.search
  ) as RouteType;
  clHistory.replace(newLocalizedUrl);
}

/*  @param: locale : the locale you want to replace the one in the current pathname with
 *   prerequisite : the current pathname includes one locale, and the url starts with it.
 *   handles well starting and/or finishing and/or not starting and/or not finishing with '/'
 *   !! this function overrides the browsers url and should not leave this component
 *   (no importing it except for tests)
 */
function replaceUrlLocale(locale: SupportedLocale) {
  const newLocalizedUrl = replacePathnameLocale(
    location.pathname,
    locale,
    location.search
  ) as RouteType;
  // replaces current location with updated url
  clHistory.replace(newLocalizedUrl);
}

export function hasTextInSpecifiedLocale(
  multiloc: Multiloc,
  locale: SupportedLocale
): boolean {
  return (
    Object.prototype.hasOwnProperty.call(multiloc, locale) &&
    multiloc[locale] !== ''
  );
}
