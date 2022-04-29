import { first } from 'rxjs/operators';
import { LocationDescriptor } from 'history';
import { localeStream } from 'services/locale';
import updateLocationDescriptor from 'utils/cl-router/updateLocationDescriptor';
// tslint:disable-next-line:no-vanilla-routing

// overrides push and replace methods so they update the location with the current locale from the locale stream
function historyMethod(
  method: 'push' | 'replace',
  location: LocationDescriptor
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
  push: (location: LocationDescriptor): void => historyMethod('push', location),
  replace: (location: LocationDescriptor): void =>
    historyMethod('replace', location),
};
