import { RouteType } from 'routes';
import { first } from 'rxjs/operators';

import history from 'utils/browserHistory';
import updateLocationDescriptor from 'utils/cl-router/updateLocationDescriptor';
import { localeStream } from 'utils/localeStream';
import { scrollToTop as scrollTop } from 'utils/scroll';
// tslint:disable-next-line:no-vanilla-routing

type Options = {
  scrollToTop?: boolean;
};

// overrides push and replace methods so they update the location with the current locale from the locale stream
function historyMethod(
  method: 'push' | 'replace',
  location: Partial<Location> | RouteType,
  options?: Options
): void {
  // 'gets' current locale
  localeStream()
    .observable.pipe(first())
    .subscribe((locale) => {
      // calls the vanilla react-router method with updated location
      history[method](updateLocationDescriptor(location, locale));

      if (options?.scrollToTop) {
        scrollTop();
      }
    });
}

export default {
  ...history,
  push: (location: Partial<Location> | RouteType, options?: Options): void =>
    historyMethod('push', location, { scrollToTop: options?.scrollToTop }),
  replace: (location: Partial<Location> | RouteType, options?: Options): void =>
    historyMethod('replace', location, { scrollToTop: options?.scrollToTop }),
  goBack: () => history.back(),
  // Add missing methods for React Router v6/v7 compatibility
  createURL: (location: any) =>
    new URL(history.createHref(location), window.location.origin),
  encodeLocation: (location: any) => location,
  // Wrap listen to add missing delta property
  listen: (listener: any) => {
    return history.listen((update: any) => {
      listener({ ...update, delta: update.action === 'POP' ? -1 : 1 });
    });
  },
};
