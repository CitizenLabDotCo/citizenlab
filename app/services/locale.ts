import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { API_PATH } from 'containers/App/constants';
import { currentTenantStream } from 'services/tenant';
import { authUserStream } from 'services/auth';
import { store } from 'app';
import { changeLocale } from 'containers/LanguageProvider/actions';

export function localeStream() {
  const authUser$ = authUserStream().observable;
  const currentTenantLocales$ = currentTenantStream().observable.map(tenant => tenant.data.attributes.settings.core.locales);

  const observable = Rx.Observable.combineLatest(
    authUser$,
    currentTenantLocales$
  ).map(([authUser, currentTenantLocales]) => {
    let locale = 'en';

<<<<<<< HEAD
    if (authUser && _.isString(authUser.data.attributes.locale) && _.includes(currentTenantLocales, authUser.data.attributes.locale)) {
      locale = authUser.data.attributes.locale;
=======
    if (process.env.CROWDIN_PLUGIN_ENABLED) {
      locale = 'ach';
    } else if (authUser && _.isString(authUser.data.attributes.locale) && _.includes(currentTenantLocales, authUser.data.attributes.locale)) {
      return authUser.data.attributes.locale;
>>>>>>> 759d07232b26c7764e47e4426993d0167027e88e
    } else if (currentTenantLocales && currentTenantLocales.length > 0) {
      locale = currentTenantLocales[0];
    }

    store.dispatch(changeLocale(locale));

    return locale;
  });

  return { observable };
}
