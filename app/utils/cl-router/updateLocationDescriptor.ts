import { getUrlLocale } from 'services/locale';
import { LocationDescriptor, LocationDescriptorObject } from 'history';

export default function updateLocationDescriptor(location: LocationDescriptor, locale): LocationDescriptorObject {
  let descriptor: LocationDescriptorObject;

  if (typeof(location) === 'string') {
    descriptor = {
      pathname: location,
    };
  } else {
    descriptor = { ...location };
  }

  const pathLocale = descriptor.pathname && getUrlLocale(descriptor.pathname);

  if (!pathLocale) {
    descriptor.pathname = `/${locale}${descriptor.pathname}`;
  }

  descriptor.state = { ...descriptor.state, locale };

  return descriptor;
}
