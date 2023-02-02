import posthog from 'posthog-js';
import { combineLatest } from 'rxjs';
import { authUserStream } from 'services/auth';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { events$, pageChanges$ } from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';

import { isAdmin, isModerator } from 'services/permissions/roles';
import { ModuleConfiguration } from 'utils/moduleUtils';

const POSTHOG_API_TOKEN = process.env.POSTHOG_API_TOKEN;

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    combineLatest([
      currentAppConfigurationStream().observable,
      authUserStream().observable,
    ]).subscribe(([appConfig, user]) => {
      if (!POSTHOG_API_TOKEN) return;
      if (!isNilOrError(user) && (isAdmin(user) || isModerator(user))) {
        posthog.init(POSTHOG_API_TOKEN, {
          api_host: 'https://eu.posthog.com',
          autocapture: false,
          persistence: 'memory', //no cookies
          loaded: function (ph) {
            posthog.opt_in_capturing();
            ph.identify(user.data.id, {
              email: user.data.attributes.email,
              name: `${user.data.attributes.first_name} ${user.data.attributes.last_name}`,
              firstName: user.data.attributes.first_name,
              lastName: user.data.attributes.last_name,
              locale: user.data.attributes.locale,
              highestRole: user.data.attributes.highest_role,
            });

            ph.group('tenant', appConfig.data.id, {
              name: appConfig.data.attributes.name,
              host: appConfig.data.attributes.host,
              lifecycleStage:
                appConfig.data.attributes.settings.core.lifecycle_stage,
            });

            ph.register({
              tenantId: appConfig.data.id,
            });
          },
        });
      } else {
        posthog.reset();
        posthog.opt_out_capturing();
      }
    });

    events$.subscribe((event) => {
      posthog.capture(event.name, event.properties);
    });

    pageChanges$.subscribe((_pageChange) => {
      posthog.capture('$pageview');
    });
  },
};

export default configuration;
