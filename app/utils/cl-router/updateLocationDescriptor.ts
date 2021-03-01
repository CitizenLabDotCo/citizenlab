import { isString } from 'lodash-es';
import {
  getUrlLocale,
  replacePathnameLocale,
  setPathnameLocale,
} from 'services/locale';
import { LocationDescriptor, LocationDescriptorObject } from 'history';
import { Locale } from 'typings';

// prerequisite : the pathname (location or lcoation.pathname) should start with a / or a locale
export default function updateLocationDescriptor(
  location: LocationDescriptor,
  locale: Locale
): LocationDescriptorObject {
  const descriptor = isString(location) ? { pathname: location } : location;
  const urlLocale = descriptor.pathname
    ? getUrlLocale(descriptor.pathname)
    : null;

  if (descriptor.pathname) {
    if (!urlLocale && locale) {
      descriptor.pathname = setPathnameLocale(descriptor.pathname, locale);
    } else if (urlLocale && locale && urlLocale !== locale) {
      descriptor.pathname = replacePathnameLocale(descriptor.pathname, locale);
    }
  }

  descriptor.state = { ...(descriptor.state as object), locale };

  return descriptor;
}

export function removeLocale(
  location: LocationDescriptor
): { pathname?: string; urlLocale: string | null } {
  const pathname = isString(location) ? location : location.pathname;
  const urlLocale = pathname ? getUrlLocale(pathname) : null;

  const result = { pathname, urlLocale };
  if (pathname && urlLocale) {
    const matchRegexp = new RegExp(`^\/(${urlLocale})\/`);
    result.pathname = `${pathname.replace(matchRegexp, '/')}`;
  }

  return result;
}
