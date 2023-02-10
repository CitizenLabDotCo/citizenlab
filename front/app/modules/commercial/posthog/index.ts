/**
 * PostHog is a data analytics tool. This module listens to events (user, event,
 * pageChange) and submits these events, enriched with some extra data , to
 * PostHog. We are __only__ activating PostHog for admins and moderators, so
 * care has been taken to not load its rather large bundle size or submit any
 * data for visitors or regular users
 */

import { combineLatest, pairwise, startWith, Subscription } from 'rxjs';
import { authUserStream } from 'services/auth';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { events$, pageChanges$ } from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';

import { isAdmin, isModerator } from 'services/permissions/roles';
import { ModuleConfiguration } from 'utils/moduleUtils';

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;

let eventsSubscription: Subscription | null = null;
let pagesSubscription: Subscription | null = null;

/** There seems to be no documented way to check whether posthog is initialized
 * already, so we'll just do some manual state management 🤷‍♂️ */
let posthogInitialized = false;

/** Posthog has a large bundle size, so we don't just import it, but only
 * when we actually need it */
const lazyLoadedPosthog = async () => {
  const ph = await import('posthog-js');
  return ph.default;
};

const initializePosthog = async (token, user, appConfig) => {
  const posthog = await lazyLoadedPosthog();

  posthog.init(token, {
    api_host: 'https://eu.posthog.com',
    autocapture: false,
    persistence: 'memory', //no cookies
    loaded: function (ph) {
      posthogInitialized = true;

      if (posthog.has_opted_out_capturing({ enable_persistence: false })) {
        posthog.opt_in_capturing({ enable_persistence: false });
      }

      // This sets the user for all subsequent events, and sets/updates her attributes
      ph.identify(user.data.id, {
        email: user.data.attributes.email,
        name: `${user.data.attributes.first_name} ${user.data.attributes.last_name}`,
        first_name: user.data.attributes.first_name,
        last_name: user.data.attributes.last_name,
        locale: user.data.attributes.locale,
        highest_role: user.data.attributes.highest_role,
      });

      // These are the groups we're associating the user with
      ph.group('tenant', appConfig.data.id, {
        name: appConfig.data.attributes.name,
        host: appConfig.data.attributes.host,
        lifecycle_stage:
          appConfig.data.attributes.settings.core.lifecycle_stage,
      });

      // These properties will be sent along with all events
      ph.register({
        tenantId: appConfig.data.id,
      });
    },
  });

  if (!eventsSubscription || eventsSubscription.closed) {
    eventsSubscription = events$.subscribe((event) => {
      posthog.capture(event.name, event.properties);
    });
  }

  if (!pagesSubscription || pagesSubscription.closed) {
    pagesSubscription = pageChanges$.subscribe((_pageChange) => {
      posthog.capture('$pageview');
    });
  }
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    if (!POSTHOG_API_KEY) return;

    combineLatest([
      currentAppConfigurationStream().observable,
      authUserStream().observable.pipe(startWith(null), pairwise()),
    ]).subscribe(async ([appConfig, [prevUser, user]]) => {
      // In case the user signs in or visits signed in as an admin/moderator
      if (!isNilOrError(user) && (isAdmin(user) || isModerator(user))) {
        initializePosthog(POSTHOG_API_KEY, user, appConfig);
      }

      // In case the user signs out
      if (prevUser && !user && posthogInitialized) {
        const posthog = await lazyLoadedPosthog();
        pagesSubscription?.unsubscribe();
        eventsSubscription?.unsubscribe();

        // There seems to be no way to call opt_out_capturing without posthog
        // writing to localstorage. Clearing it, instead, seems to work fine.
        posthog.clear_opt_in_out_capturing({ enable_persistence: false });

        posthogInitialized = false;
      }
    });
  },
};

export default configuration;
