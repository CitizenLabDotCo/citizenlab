import { authUserStream } from 'services/auth';
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
import { isAdmin, isModerator, isSuperAdmin } from 'services/permissions/roles';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { ModuleConfiguration } from 'utils/moduleUtils';

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    satismeter: 'satismeter';
  }
}

const destinationConfig: IDestinationConfig = {
  key: 'satismeter',
  category: 'analytics',
  feature_flag: 'satismeter',
  hasPermission: (user) =>
    !!user &&
    (isAdmin({ data: user }) || isModerator({ data: user })) &&
    !isSuperAdmin({ data: user }),
  name: () => 'Satismeter',
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    combineLatest([
      currentAppConfigurationStream().observable,
      authUserStream().observable,
      initializeFor('satismeter'),
    ]).subscribe(([tenant, user, _]) => {
      (function () {
        if (isNilOrError(tenant)) return;

        window.satismeter =
          window.satismeter ||
          function () {
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
                    name: `${user.data.attributes.first_name} + ${user.data.attributes.last_name}`,
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
