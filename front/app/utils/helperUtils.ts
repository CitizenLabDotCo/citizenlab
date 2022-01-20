import {
  Locale,
  Multiloc,
  GraphqlLocale,
  IParticipationContextType,
  CLErrorsJSON,
} from 'typings';
import { trim, isUndefined } from 'lodash-es';
import { removeUrlLocale } from 'services/locale';
import { viewportWidths } from 'utils/styleUtils';

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
  return isNil(obj) || isError(obj);
}

export function isNil(obj: any): obj is undefined | null {
  return obj === undefined || obj === null;
}

export function isError(obj: any): obj is Error {
  return obj instanceof Error;
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

export function isNonEmptyString(str: string) {
  return isString(str) && trim(str) !== '';
}

export function sum(a, b) {
  return a + b;
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
  const uuidRegExp =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
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

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(f): f is Function {
  return f instanceof Function;
}

export function isString(s): s is string {
  return typeof s === 'string';
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isOrReturnsString(s: any, ...args: any[]): s is Function {
  return isString(s) || (isFunction(s) && isString(s(...args)));
}

export function matchPathToUrl(tabUrl: string) {
  return new RegExp(`^/([a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?)(${tabUrl})(/)?$`);
}

export const anyIsUndefined = (...args) => args.some(isUndefined);
export const anyIsDefined = (...args) => args.some((arg) => !isUndefined(arg));

export function removeFocusAfterMouseClick(event: React.MouseEvent) {
  event.preventDefault();
}

export function isDesktop(windowWidth: number) {
  return windowWidth > viewportWidths.largeTablet;
}

export const keys = <T>(obj: T) => Object.keys(obj) as Array<keyof T>;
