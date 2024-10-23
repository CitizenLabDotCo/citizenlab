// eslint-disable-next-line no-restricted-imports
import { Location } from 'history';
import { isString } from 'lodash-es';
import { SupportedLocale } from 'typings';

import { getUrlLocale } from 'utils/getUrlLocale';
import { replacePathnameLocale } from 'utils/replacePathnameLocale';
import { setPathnameLocale } from 'utils/setPathnameLocale';

type LocationDescriptorObject = Partial<Location> | string;

// prerequisite : the pathname (location or lcoation.pathname) should start with a / or a locale
export default function updateLocationDescriptor(
  location: LocationDescriptorObject,
  locale: SupportedLocale
) {
  const descriptor: Partial<Location> = isString(location)
    ? { pathname: location }
    : location;
  const urlLocale = descriptor.pathname
    ? getUrlLocale(descriptor.pathname)
    : null;

  if (descriptor.pathname) {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!urlLocale && locale) {
      descriptor.pathname = setPathnameLocale(descriptor.pathname, locale);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
