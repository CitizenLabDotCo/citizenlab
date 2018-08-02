import { isString } from 'lodash';
import { getUrlLocale } from 'services/locale';
import { LocationDescriptor } from 'history';
import { Locale } from 'typings';

export default function updateLocationDescriptor(location: LocationDescriptor, locale: Locale) {
  const descriptor = (isString(location) ? { pathname: location } : location);
  const urlLocale = (descriptor.pathname ? getUrlLocale(descriptor.pathname) : null);

  if (descriptor.pathname) {
    if (!urlLocale && locale) {
      descriptor.pathname = `/${locale}${descriptor.pathname}`;
    } else if (urlLocale && locale && urlLocale !== locale) {
      const matchRegexp = new RegExp(`^\/(${urlLocale})\/`);
      descriptor.pathname = `${descriptor.pathname.replace(matchRegexp, `/${locale}/`)}`;
    }
  }

  descriptor.state = { ...descriptor.state, locale };

  return descriptor;
}
