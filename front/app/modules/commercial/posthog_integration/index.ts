/**
 * PostHog is a data analytics tool. This module listens to events (user, event,
 * pageChange) and submits these events, enriched with some extra data , to
 * PostHog. We are __only__ activating PostHog for admins and moderators, so
 * care has been taken to not load its rather large bundle size or submit any
 * data for visitors or regular users
 */

import { PostHog } from 'posthog-js';
import {
  BehaviorSubject,
  combineLatest,
  pairwise,
  startWith,
  Subscription,
} from 'rxjs';

import appConfigurationStream from 'api/app_configuration/appConfigurationStream';
import { IAppConfiguration } from 'api/app_configuration/types';
import authUserStream from 'api/me/authUserStream';
import { IUser } from 'api/users/types';

import { events$, pageChanges$ } from 'utils/analytics';
import eventEmitter, { IEventEmitterEvent } from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';
import { ModuleConfiguration } from 'utils/moduleUtils';
import { isAdmin, isRegularUser } from 'utils/permissions/roles';
import { getFullName } from 'utils/textUtils';

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;

let eventsSubscription: Subscription | null = null;
let pagesSubscription: Subscription | null = null;

/** Posthog has a large bundle size, so we don't just import it, but only
 * when we actually need it */
const lazyLoadedPosthog = async () => {
  const ph = await import('posthog-js');
  return ph.default;
};

let posthogClient: PostHog | undefined;

const initializePosthog = async (
  token: string,
  user: IUser | undefined,
  appConfig: IAppConfiguration
) => {
  const posthog = await lazyLoadedPosthog();

  posthog.init(token, {
    api_host: 'https://eu.posthog.com',
    disable_session_recording: true,
    autocapture: false,
    persistence: 'memory', // no cookies
    loaded(ph) {
      if (posthog.has_opted_out_capturing()) {
        posthog.opt_in_capturing();
      }

      if (user) {
        // This sets the user for all subsequent events, and sets/updates her attributes
        ph.identify(user.data.id, {
          email: user.data.attributes.email,
          name: getFullName(user.data),
          first_name: user.data.attributes.first_name,
          last_name: user.data.attributes.last_name,
          locale: user.data.attributes.locale,
          highest_role: user.data.attributes.highest_role,
        });
      }

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

  return posthog;
};

// This event emitter wrapper is needed because the native eventEmitter observable does not work when inside `combineLatest`
const eventEmitterWrapperStream = new BehaviorSubject<
  IEventEmitterEvent<unknown> | undefined
>(undefined);

eventEmitter
  .observeEvent('user_session_recording_accepted')
  .subscribe((event) => {
    eventEmitterWrapperStream.next(event);
  });

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    if (!POSTHOG_API_KEY) return;

    combineLatest([
      eventEmitterWrapperStream,
      appConfigurationStream,
      authUserStream.pipe(startWith(null), pairwise()),
    ]).subscribe(
      async ([userSessionRecordingAccepted, appConfig, [prevUser, user]]) => {
        if (appConfig) {
          // USERS

          // Initialize posthog for users that accepted the session recording
          if (userSessionRecordingAccepted?.eventValue === true) {
            // Check the feature flag
            const userSessionRecordingSettings =
              appConfig.data.attributes.settings.user_session_recording;

            if (
              !userSessionRecordingSettings?.allowed ||
              !userSessionRecordingSettings.enabled
            ) {
              return;
            }
            if (!posthogClient) {
              posthogClient = await initializePosthog(
                POSTHOG_API_KEY,
                user ?? undefined,
                appConfig
              );
            }

            posthogClient.startSessionRecording();
          }

          // ADMINS AND MODERATORS

          // Check the feature flag
          const posthogSettings =
            appConfig.data.attributes.settings.posthog_integration;

          if (!posthogSettings?.allowed || !posthogSettings.enabled) return;

          // In case the user signs in or visits signed in as an admin/moderator
          if (
            !posthogClient &&
            !isNilOrError(user) &&
            (isAdmin(user) || !isRegularUser(user))
          ) {
            posthogClient = await initializePosthog(
              POSTHOG_API_KEY,
              user,
              appConfig
            );
          }

          // In case an admin signs out
          if (
            prevUser &&
            !user &&
            posthogClient &&
            userSessionRecordingAccepted?.eventValue !== true
          ) {
            pagesSubscription?.unsubscribe();
            eventsSubscription?.unsubscribe();

            // There seems to be no way to call opt_out_capturing without posthog
            // writing to localstorage. Clearing it, instead, seems to work fine.
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            posthogClient?.clear_opt_in_out_capturing();
          }
        }
      }
    );
  },
};

export default configuration;
