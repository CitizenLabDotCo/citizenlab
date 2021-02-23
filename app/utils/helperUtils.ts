import {
  Locale,
  Multiloc,
  GraphqlLocale,
  IParticipationContextType,
  CLErrorsJSON,
} from 'typings';
import { isString } from 'util';
import { trim } from 'lodash-es';
import { removeUrlLocale } from 'services/locale';

export function capitalizeParticipationContextType(
  type: IParticipationContextType
) {
  if (type === 'project') {
    return 'Project';
  } else {
    return 'Phase';
  }
}

export function isNilOrError(obj: any): obj is undefined | null | Error {
  return obj === undefined || obj === null || obj instanceof Error;
}

export function isApiError(obj: any): obj is CLErrorsJSON {
  return (obj as CLErrorsJSON)?.json !== undefined;
}

export function isUndefinedOrError(obj: any): obj is undefined | Error {
  return obj === undefined || obj instanceof Error;
}

export function isEmptyMultiloc(multiloc: Multiloc) {
  let validTranslation = false;

  for (const lang in multiloc) {
    if (Object.prototype.hasOwnProperty.call(multiloc, lang)) {
      if (multiloc[lang].length > 0) {
        validTranslation = true;
      }
    }
  }

  return !validTranslation;
}
export function isFullMultiloc(multiloc: Multiloc) {
  for (const lang in multiloc) {
    if (Object.prototype.hasOwnProperty.call(multiloc, lang)) {
      if (multiloc[lang].length === 0) {
        return false;
      }
    }
  }

  return true;
}

export function isNonEmptyString(str: string) {
  return isString(str) && trim(str) !== '';
}

export function returnFileSize(number) {
  if (number < 1024) {
    return `${number} bytes`;
  } else if (number >= 1024 && number < 1048576) {
    return `${(number / 1024).toFixed(1)} KB`;
  } else if (number >= 1048576) {
    return `${(number / 1048576).toFixed(1)} MB`;
  }
  return;
}

export function sum(a, b) {
  return a + b;
}
export function getFormattedBudget(
  locale: Locale,
  budget: number,
  currency: string
) {
  return new Intl.NumberFormat(locale, {
    currency,
    localeMatcher: 'best fit',
    style: 'currency',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(budget);
}

export function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

type pageKeys =
  | 'admin'
  | 'idea_form'
  | 'initiative_form'
  | 'idea_edit'
  | 'initiative_edit'
  | 'sign_in'
  | 'sign_up'
  | 'email-settings';

export function isPage(pageKey: pageKeys, pathName: string) {
  /**
   * Checks whether current page is the desired page
   *
   * @param pageKey - key to indicate the desired page
   * @param pathName - pathname to check (usually current path aka location.pathname)
   *
   * @returns Boolean. True if current page matches the pageKey's url, false otherwise.
   */

  const pathnameWithoutLocale = removeUrlLocale(pathName);

  switch (pageKey) {
    case 'email-settings':
      return pathnameWithoutLocale.startsWith('/email-settings');
    case 'admin':
      return pathnameWithoutLocale.startsWith('/admin/');
    case 'initiative_form':
      // Needs to use endsWith
      // Otherwise an initiative with the name 'new playground for our children' would also pass
      return pathnameWithoutLocale.endsWith('/initiatives/new');
    case 'idea_form':
      return pathnameWithoutLocale.endsWith('/ideas/new');
    case 'idea_edit':
      return pathnameWithoutLocale.startsWith('/ideas/edit/');
    case 'initiative_edit':
      return pathnameWithoutLocale.startsWith('/initiatives/edit/');
    case 'sign_in':
      return pathnameWithoutLocale.startsWith('/sign-in');
    case 'sign_up':
      return pathnameWithoutLocale.startsWith('/sign-up');
  }
}

export function stopPropagation(event) {
  event.stopPropagation();
}

export function stripHtmlTags(str: string | null | undefined) {
  if (str === null || str === undefined || str === '') {
    return '';
  } else {
    return str.replace(
      /<\/?(p|div|span|ul|ol|li|br|em|img|strong|a)[^>]{0,}\/?>/g,
      ''
    );
  }
}

// e.g. 'en-GB' -> 'enGb'
export function convertToGraphqlLocale(locale: Locale) {
  const newLocale = locale.replace('-', '');
  const length = newLocale.length - 1;
  return (newLocale.substring(0, length) +
    newLocale.substr(length).toLowerCase()) as GraphqlLocale;
}

export const uuidRegExp =
  '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

export function isUUID(value: string) {
  const uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
  return uuidRegExp.test(value);
}

export function toggleElementInArray(array, value) {
  const index = array.indexOf(value);

  if (index === -1) {
    array.push(value);
  } else {
    array.splice(index, 1);
  }
}

export function endsWith(
  pathname: string | undefined | null,
  endsWith: string | string[]
) {
  if (pathname) {
    const pathnameWithoutTrailingSlash = pathname.replace(/\/$/, '');
    const endsWithArray = isString(endsWith) ? [endsWith] : endsWith;
    return endsWithArray.some((text) =>
      pathnameWithoutTrailingSlash.endsWith(text)
    );
  }

  return false;
}

export function getUrlSegments(pathname: string | null) {
  if (pathname) {
    return pathname?.replace(/^\/+/g, '').split('/');
  }

  return [];
}
