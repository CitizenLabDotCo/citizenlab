import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { API_PATH } from 'containers/App/constants';
import { observeCurrentTenant } from 'services/tenant';
import auth from 'services/auth';

export function observeLocale() {
  return Rx.Observable.combineLatest(
    observeCurrentTenant().observable,
    auth.observeAuthUser()
  ).map(([tenant, authUser]) => {
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
