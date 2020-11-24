import { authUserStream } from 'services/auth';
import { initializeFor } from 'utils/analytics';
import { SATISMETER_WRITE_KEY } from 'containers/App/constants';
import { combineLatest } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';
import {
  registerDestination,
  IDestinationConfig,
} from 'components/ConsentManager/destinations';
import { isAdmin, isModerator, isSuperAdmin } from 'services/permissions/roles';

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
};

registerDestination(destinationConfig);

combineLatest([
  authUserStream().observable,
  initializeFor('satismeter'),
]).subscribe(([user, _]) => {
  (function () {
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
        writeKey: SATISMETER_WRITE_KEY,
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
