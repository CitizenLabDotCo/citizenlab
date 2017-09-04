import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { API_PATH } from 'containers/App/constants';
import { currentTenantStream } from 'services/tenant';
import auth from 'services/auth';

export function observeLocale() {
  const currentTenant$ = currentTenantStream().observable;
  const authUser$ = auth.observeAuthUser();

  return Rx.Observable.combineLatest(currentTenant$, authUser$).map(([tenant, authUser]) => {
    const tenantLocales = tenant.data.attributes.settings.core.locales;

    if (authUser) {
      const authUserLocale = authUser.data.attributes.locale;

      if (tenantLocales[authUserLocale]) {
        return authUserLocale;
      }
    }

    return tenantLocales[0];
  });
}
