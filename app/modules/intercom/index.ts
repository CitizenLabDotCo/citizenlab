import 'components/ConsentManager/destinations';
import { combineLatest } from 'rxjs';
import { authUserStream } from 'services/auth';
import { currentTenantStream } from 'services/tenant';
import {
  events$,
  initializeFor,
  pageChanges$,
  shutdownFor,
  tenantInfo,
} from 'utils/analytics';
import { INTERCOM_APP_ID } from 'containers/App/constants';
import { isNilOrError } from 'utils/helperUtils';

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    intercom: 'intercom';
  }
}

combineLatest([
  currentTenantStream().observable,
  authUserStream().observable,
  initializeFor('intercom'),
]).subscribe(([tenant, user, _]) => {
  (function () {
    const w = window;
    const ic = w.Intercom;
    if (typeof ic === 'function') {
      ic('reattach_activator');
      ic('update', w.intercomSettings);
    } else {
      const d = document;
      const i = function () {
        i.c(arguments);
      };
      i.q = [];
      i.c = function (args) {
        i.q.push(args);
      };
      w.Intercom = i;
      const l = function () {
        const s = d.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = `https://widget.intercom.io/widget/'${INTERCOM_APP_ID}`;
        const x = d.getElementsByTagName('script')[0];
        x.parentNode?.insertBefore(s, x);
      };
      if (document.readyState === 'complete') {
        l();
      } else if (w.attachEvent) {
        w.attachEvent('onload', l);
      } else {
        w.addEventListener('load', l, false);
      }
    }
  })();

  window.Intercom &&
    window.Intercom('boot', {
      app_id: INTERCOM_APP_ID,
      ...(!isNilOrError(user)
        ? {
            email: user.data.attributes.email,
            user_id: user.data.id,
            name: `${user.data.attributes.first_name} + ${user.data.attributes.last_name}`,
          }
        : {}),
      ...(!isNilOrError(tenant)
        ? {
            company: {
              company_id: tenant.data.id,
              name: tenant.data.attributes.name,
            },
          }
        : {}),
    });
});

shutdownFor('intercom').subscribe(() => {
  if (window.Intercom) {
    window.Intercom('shutdown');
  }
});

combineLatest([events$, currentTenantStream().observable]).subscribe(
  ([event, tenant]) => {
    if (!isNilOrError(tenant) && window.Intercom) {
      const properties = {
        ...tenantInfo(tenant.data),
        ...event.properties,
      };
      window.Intercom('trackEvent', event.name, properties);
    }
  }
);

pageChanges$.subscribe((_pageChange) => {
  if (window.Intercom) {
    window.Intercom('update', {
      last_request_at: new Date().getTime() / 1000,
    });
  }
});
