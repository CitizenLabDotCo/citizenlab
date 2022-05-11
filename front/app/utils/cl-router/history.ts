import { first } from 'rxjs/operators';
import { Path } from 'history';
import { localeStream } from 'services/locale';
import updateLocationDescriptor from 'utils/cl-router/updateLocationDescriptor';
// tslint:disable-next-line:no-vanilla-routing
import { rootHistory as browserHistory } from 'root';

type LocationDescriptorObject = {
  pathname: string;
  search?: string;
  hash?: string;
};

type LocationDescriptor = LocationDescriptorObject | Path | string;

// overrides push and replace methods so they update the location with the current locale from the locale stream
function historyMethod(
  method: 'push' | 'replace',
  location: LocationDescriptor
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
  push: (location: LocationDescriptor): void => historyMethod('push', location),
  replace: (location: LocationDescriptor): void =>
    historyMethod('replace', location),
  goBack: () => browserHistory.back(),
};
