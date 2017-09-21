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

    if (authUser) {
      const authUserLocale = authUser.data.attributes.locale;

      if (currentTenantLocales[authUserLocale]) {
        locale = authUserLocale;
      }
    } else if (currentTenantLocales && currentTenantLocales.length > 0) {
      locale = currentTenantLocales[0];
    }

    store.dispatch(changeLocale(locale));

    return locale;
  });

  return { observable };
}
