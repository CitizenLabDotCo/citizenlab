import { browserHistory } from 'react-router';
import { LocationDescriptor } from 'history';
import { localeStream } from 'services/locale';
import updateLocationDescriptor from './updateLocationDescriptor';

function historyMethod(method: 'push' | 'replace', location: LocationDescriptor): void {
  localeStream().observable
  .first()
  .toPromise()
  .then((locale) => {
    browserHistory[method](updateLocationDescriptor(location, locale));
  });
}

export default {
  push: (location: LocationDescriptor): void => historyMethod('push', location),
  replace: (location: LocationDescriptor): void => historyMethod('replace', location),
};
