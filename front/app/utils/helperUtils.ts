import { trim, isUndefined } from 'lodash-es';
import { SupportedLocale, Multiloc, GraphqlLocale } from 'typings';
import { v4 as uuidv4 } from 'uuid';

import { locales } from 'containers/App/constants';

import { removeUrlLocale } from './removeUrlLocale';

type Nil = undefined | null;
export type NilOrError = Nil | Error;

export function isNilOrError(obj: any): obj is NilOrError {
  return isNil(obj) || isError(obj);
}

export function isNil(obj: any): obj is Nil {
  return obj === undefined || obj === null;
}

export function isError(obj: any): obj is Error {
  return obj instanceof Error;
}

export function isEmptyMultiloc(multiloc: Multiloc) {
  let validTranslation = false;

  for (const lang in multiloc) {
    if (Object.prototype.hasOwnProperty.call(multiloc, lang)) {
      if (multiloc[lang] && multiloc[lang].length > 0) {
        validTranslation = true;
      }
    }
  }

  return !validTranslation;
}

export function isNonEmptyString(str: string) {
  return isString(str) && trim(str) !== '';
}

type pageKeys =
  | 'admin'
  | 'idea_form'
  | 'idea_edit'
  | 'native_survey'
  | 'sign_in'
  | 'sign_up'
  | 'email-settings'
  | 'pages_menu'
  | 'event_page';

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
    case 'idea_form':
      return pathnameWithoutLocale.endsWith('/ideas/new');
    case 'idea_edit':
      return pathnameWithoutLocale.startsWith('/ideas/edit/');
    case 'native_survey':
      return pathnameWithoutLocale.endsWith('/surveys/new');
    case 'sign_in':
      return pathnameWithoutLocale.startsWith('/sign-in');
    case 'sign_up':
      return pathnameWithoutLocale.startsWith('/sign-up');
    case 'pages_menu':
      return pathnameWithoutLocale.includes('/admin/pages-menu');
    case 'event_page':
      return pathnameWithoutLocale.startsWith('/events/');
  }
}

export const isIdeaShowPage = (urlSegments: string[]) => {
  const firstUrlSegment = urlSegments[0];
  const secondUrlSegment = urlSegments[1];
  const lastUrlSegment = urlSegments[urlSegments.length - 1];

  return (
    urlSegments.length === 3 &&
    locales.includes(firstUrlSegment) &&
    secondUrlSegment === 'ideas' &&
    lastUrlSegment !== 'new'
  );
};

export const initiativeShowPageSlug = (urlSegments: string[]) => {
  const firstUrlSegment = urlSegments[0];
  const secondUrlSegment = urlSegments[1];
  const lastUrlSegment = urlSegments[urlSegments.length - 1];

  if (
    urlSegments.length === 3 &&
    locales.includes(firstUrlSegment) &&
    secondUrlSegment === 'initiatives' &&
    lastUrlSegment !== 'new'
  ) {
    return lastUrlSegment;
  } else {
    return null;
  }
};

export function stopPropagation(event) {
  event.stopPropagation();
}

// e.g. 'en-GB' -> 'enGb'
export function convertToGraphqlLocale(locale: SupportedLocale) {
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

export function isString(s: unknown): s is string {
  return typeof s === 'string';
}

export const isTopBarNavActive = (
  basePath: string,
  pathname: string,
  tabUrl: string
): boolean => {
  if (pathname.endsWith(basePath) && tabUrl.endsWith(basePath)) {
    return true;
  }

  return !tabUrl.endsWith(basePath) && pathname.includes(tabUrl);
};

export const anyIsUndefined = (...args) => args.some(isUndefined);
export const anyIsDefined = (...args) => args.some((arg) => !isUndefined(arg));

export function removeFocusAfterMouseClick(event: React.MouseEvent) {
  event.preventDefault();
}

export const keys = <T extends object>(obj: T) =>
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  obj && (Object.keys(obj) as Array<keyof T>);

export const get = <T, K extends keyof T>(obj: T, key: K) => obj[key];

interface ObjectWithId {
  id: string;
}

export const byId = (array: ObjectWithId[]) =>
  array.reduce((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});

export const indices = (n: number) => [...Array(n)].map((_, i) => i);

export const isObject = (
  v: any
): v is Record<string | number | symbol, any> => {
  return Object.prototype.toString.call(v) === '[object Object]';
};

// Src: https://stackoverflow.com/a/28056903
export function hexToRGBA(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } else {
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export const classNames = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export function generateTempId() {
  return `TEMP-ID-${uuidv4()}`;
}
