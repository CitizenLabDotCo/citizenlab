import { first } from 'rxjs/operators';
import { localeStream } from 'utils/locale';
import updateLocationDescriptor from 'utils/cl-router/updateLocationDescriptor';
// tslint:disable-next-line:no-vanilla-routing

import history from 'utils/browserHistory';

// overrides push and replace methods so they update the location with the current locale from the locale stream
function historyMethod(
  method: 'push' | 'replace',
  location: Partial<Location> | string
): void {
  // 'gets' current locale
  localeStream()
    .observable.pipe(first())
    .subscribe((locale) => {
      // calls the vanilla react-router method with updated location
      history[method](updateLocationDescriptor(location, locale));
    });
}

export default {
  ...history,
  push: (location: Partial<Location> | string): void =>
    historyMethod('push', location),
  replace: (location: Partial<Location> | string): void =>
    historyMethod('replace', location),
  goBack: () => history.back(),
};
