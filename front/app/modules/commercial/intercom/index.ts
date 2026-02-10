import { combineLatest } from 'rxjs';

import appConfigurationStream from 'api/app_configuration/appConfigurationStream';
import authUserStream from 'api/me/authUserStream';

import {
  IDestinationConfig,
  registerDestination,
} from 'components/ConsentManager/destinations';

import {
  bufferUntilInitialized,
  events$,
  initializeFor,
  pageChanges$,
  shutdownFor,
  tenantInfo,
} from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';
import { ModuleConfiguration } from 'utils/moduleUtils';
import { isAdmin, isRegularUser } from 'utils/permissions/roles';
import { getFullName } from 'utils/textUtils';

export const INTERCOM_APP_ID = process.env.INTERCOM_APP_ID;

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    intercom: 'intercom';
  }
}

const destinationConfig: IDestinationConfig = {
  key: 'intercom',
  category: 'functional',
  feature_flag: 'intercom',
  hasPermission: (user) =>
    !!user && (isAdmin({ data: user }) || !isRegularUser({ data: user })),
  name: () => 'Intercom',
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    combineLatest([
      appConfigurationStream,
      authUserStream,
      initializeFor('intercom'),
    ]).subscribe(([tenant, user, _]) => {
      if (!INTERCOM_APP_ID) return;

      (function () {
        const w = window;
        const ic = w.Intercom;
        if (typeof ic === 'function') {
          ic('reattach_activator');
          ic('update', w.intercomSettings);
        } else {
          const d = document;
          const i = function () {
            // eslint-disable-next-line prefer-rest-params
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
            s.src = `https://widget.intercom.io/widget/${INTERCOM_APP_ID}`;
            const x = d.getElementsByTagName('script')[0];
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            x?.parentNode?.insertBefore(s, x);
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

      tenant &&
        window.Intercom &&
        window.Intercom('boot', {
          app_id: INTERCOM_APP_ID,
          api_base: 'https://api-iam.eu.intercom.io',
          region: 'eu',
          ...(!isNilOrError(user)
            ? {
                email: user.data.attributes.email,
                user_id: user.data.id,
                name: getFullName(user.data),
                firstName: user.data.attributes.first_name,
                lastName: user.data.attributes.last_name,
                locale: user.data.attributes.locale,
                ...tenantInfo(tenant.data),
              }
            : {}),
          ...(!isNilOrError(tenant)
            ? {
                company: {
                  company_id: tenant.data.id,
                  name: tenant.data.attributes.name,
                  ...tenantInfo(tenant.data),
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

    combineLatest([
      bufferUntilInitialized('intercom', events$),
      appConfigurationStream,
    ]).subscribe(([event, tenant]) => {
      if (!isNilOrError(tenant) && window.Intercom) {
        const properties = {
          ...tenantInfo(tenant.data),
          ...event.properties,
        };
        window.Intercom('trackEvent', event.name, properties);
      }
    });

    combineLatest([pageChanges$, appConfigurationStream]).subscribe(
      ([_pageChange, tenant]) => {
        if (window.Intercom && !isNilOrError(tenant)) {
          window.Intercom('update', {
            last_request_at: new Date().getTime() / 1000,
            company: {
              company_id: tenant.data.id,
              name: tenant.data.attributes.name,
              ...tenantInfo(tenant.data),
            },
          });
        }
      }
    );

    registerDestination(destinationConfig);
  },
};

export default configuration;
