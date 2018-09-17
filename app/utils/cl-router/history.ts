import { first } from 'rxjs/operators';
import { LocationDescriptor } from 'history';
import { localeStream } from 'services/locale';
import updateLocationDescriptor from './updateLocationDescriptor';
// tslint:disable-next-line:no-vanilla-routing
import { browserHistory } from 'react-router';

function historyMethod(method: 'push' | 'replace', location: LocationDescriptor): void {
  localeStream().observable.pipe(
    first()
  ).subscribe((locale) => {
    browserHistory[method](updateLocationDescriptor(location, locale));
  });
}

export default {
  ...browserHistory,
  push: (location: LocationDescriptor): void => historyMethod('push', location),
  replace: (location: LocationDescriptor): void => historyMethod('replace', location),
};
