import authUserStream from 'api/me/authUserStream';
import {
  bufferUntilInitialized,
  events$,
  initializeFor,
} from 'utils/analytics';
import { combineLatest } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';
import {
  registerDestination,
  IDestinationConfig,
} from 'components/ConsentManager/destinations';
import { isAdmin, isRegularUser, isSuperAdmin } from 'utils/permissions/roles';
import appConfigurationStream from 'api/app_configuration/appConfigurationStream';
import { ModuleConfiguration } from 'utils/moduleUtils';
import { getFullName } from 'utils/textUtils';

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    satismeter: 'satismeter';
  }

  interface IConsentManagerFeatureMap {
    satismeter: 'satismeter';
  }
}

const destinationConfig: IDestinationConfig = {
  key: 'satismeter',
  category: 'analytics',
  feature_flag: 'satismeter',
  hasPermission: (user) =>
    !!user &&
    (isAdmin({ data: user }) || !isRegularUser({ data: user })) &&
    !isSuperAdmin({ data: user }),
  name: () => 'Satismeter',
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    combineLatest([
      appConfigurationStream,
      authUserStream,
      initializeFor('satismeter'),
    ]).subscribe(([tenant, user, _]) => {
      (function () {
        if (isNilOrError(tenant)) return;

        window.satismeter =
          window.satismeter ||
          function () {
            // eslint-disable-next-line prefer-rest-params
            (window.satismeter.q = window.satismeter.q || []).push(arguments);
          };
        window.satismeter.l = new Date();
        const script = document.createElement('script');
        const parent = document.getElementsByTagName('script')[0].parentNode;
        script.async = true;
        script.src = 'https://app.satismeter.com/satismeter.js';
        script.onload = () =>
          window.satismeter({
            writeKey: tenant.data.attributes.settings.satismeter?.write_key,
            ...(!isNilOrError(user)
              ? {
                  userId: user.data.id,
                  traits: {
                    name: getFullName(user.data),
                    email: user.data.attributes.email,
                    createdAt: user.data.attributes.created_at,
                  },
                }
              : {}),
          });
        parent?.appendChild(script);
      })();
    });

    bufferUntilInitialized('satismeter', events$).subscribe((event) => {
      window.satismeter && window.satismeter('track', { event: event.name });
    });

    registerDestination(destinationConfig);
  },
};

export default configuration;
