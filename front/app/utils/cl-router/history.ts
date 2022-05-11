import { first } from 'rxjs/operators';
import { Location } from 'history';
import { localeStream } from 'services/locale';
import updateLocationDescriptor from 'utils/cl-router/updateLocationDescriptor';
// tslint:disable-next-line:no-vanilla-routing
import { rootHistory as browserHistory } from 'root';

// overrides push and replace methods so they update the location with the current locale from the locale stream
function historyMethod(
  method: 'push' | 'replace',
  location: Partial<Location> | string
): void {
  console.log({ history });
  // 'gets' current locale
  localeStream()
    .observable.pipe(first())
    .subscribe((locale) => {
      // calls the vanilla react-router method with updated location
      browserHistory[method](updateLocationDescriptor(location, locale));
    });
}

export default {
  ...browserHistory,
  push: (location: Partial<Location> | string): void =>
    historyMethod('push', location),
  replace: (location: Partial<Location> | string): void =>
    historyMethod('replace', location),
  goBack: () => browserHistory.back(),
};
