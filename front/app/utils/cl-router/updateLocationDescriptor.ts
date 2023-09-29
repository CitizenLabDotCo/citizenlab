import { isString } from 'lodash-es';
// eslint-disable-next-line no-restricted-imports
import { Location } from 'history';
import {
  getUrlLocale,
  replacePathnameLocale,
  setPathnameLocale,
} from 'utils/locale';
import { Locale } from 'typings';

type LocationDescriptorObject = Partial<Location> | string;

// prerequisite : the pathname (location or lcoation.pathname) should start with a / or a locale
export default function updateLocationDescriptor(
  location: LocationDescriptorObject,
  locale: Locale
) {
  const descriptor: Partial<Location> = isString(location)
    ? { pathname: location }
    : location;
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

  descriptor.state = { ...(descriptor.state as Record<string, any>), locale };

  return descriptor;
}

export function removeLocale(location: Partial<Location> | string): {
  pathname?: string;
  urlLocale: string | null;
} {
  const pathname = isString(location) ? location : location.pathname;
  const urlLocale = pathname ? getUrlLocale(pathname) : null;

  const result = { pathname, urlLocale };
  if (pathname && urlLocale) {
    const matchRegexp = new RegExp(`^/(${urlLocale})/`);
    result.pathname = `${pathname.replace(matchRegexp, '/')}`;
  }

  return result;
}
