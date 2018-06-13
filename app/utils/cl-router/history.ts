import { LocationDescriptor } from 'history';
import { localeStream } from 'services/locale';
import updateLocationDescriptor from './updateLocationDescriptor';
import { browserHistory } from 'react-router';

function historyMethod(method: 'push' | 'replace', location: LocationDescriptor): void {
  localeStream().observable
  .first()
  .toPromise()
  .then((locale) => {
    browserHistory[method](updateLocationDescriptor(location, locale));
  });
}

export default {
  ...browserHistory,
  push: (location: LocationDescriptor): void => historyMethod('push', location),
  replace: (location: LocationDescriptor): void => historyMethod('replace', location),
};
