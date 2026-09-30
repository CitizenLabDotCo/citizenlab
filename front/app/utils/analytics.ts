import { isEqual } from 'lodash-es';
import { Subject, Observable, concat, combineLatest } from 'rxjs';
import {
  buffer,
  filter,
  pairwise,
  mergeAll,
  take,
  distinctUntilChanged,
  map,
} from 'rxjs/operators';

import appConfigurationStream from 'api/app_configuration/appConfigurationStream';
import { IAppConfigurationData } from 'api/app_configuration/types';
import authUserStream from 'api/me/authUserStream';

import { ISavedDestinations } from 'components/ConsentManager/consent';
import {
  getDestinationConfig,
  IDestination,
  isDestinationActive,
} from 'components/ConsentManager/destinations';

import eventEmitter from 'utils/eventEmitter';

export interface IEvent {
  name: string;
  properties?: {
    [key: string]: any;
  };
}

interface ICustomPageChange {
  path: string;
  properties?: {
    [key: string]: any;
  };
}

export const events$ = new Subject<IEvent>();
export const pageChanges$ = new Subject<ICustomPageChange>();
export const virtualPageViews$ = new Subject<string>();

const destinationConsentChanged$ = eventEmitter
  .observeEvent<ISavedDestinations[]>('destinationConsentChanged')
  .pipe(distinctUntilChanged(isEqual));

/** Returns stream that emits when the given destination should initialize. Only
 * emits if the given destination is active and the user gave consent. Can emit
 * more then once.
 */
export const initializeFor = (destination: IDestination) => {
  return combineLatest([
    destinationConsentChanged$,
    appConfigurationStream,
    authUserStream,
  ]).pipe(
    filter(([consent, tenant, user]) => {
      if (tenant) {
        const config = getDestinationConfig(destination);

        return (
          consent.eventValue[destination] &&
          (!config || isDestinationActive(config, tenant.data, user?.data))
        );
      }
    })
  );
};

/** Returns buffered version of the given stream, that only starts emiting
 * buffered values one by one when the given destination is initialized */
export const bufferUntilInitialized = <T>(
  destination: IDestination,
  o$: Observable<T>
): Observable<T> => {
  return concat(
    o$.pipe(buffer(initializeFor(destination)), take(1), mergeAll()),
    o$
  );
};

/** Returns stream that emits when the given destination should shut itself down.
 */
export const shutdownFor = (destination: IDestination) => {
  return combineLatest([
    destinationConsentChanged$,
    appConfigurationStream,
    authUserStream,
  ]).pipe(
    map(([consent, tenant, user]) => {
      const config = getDestinationConfig(destination);
      return (
        consent.eventValue[destination] &&
        tenant &&
        (!config || isDestinationActive(config, tenant.data, user?.data))
      );
    }),
    pairwise(),
    filter(([previousActive, currentActive]) => {
      return previousActive && !currentActive;
    })
  );
};

export function tenantInfo(tenant: IAppConfigurationData) {
  return {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    tenantId: tenant && tenant.id,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    tenantName: tenant && tenant.attributes.name,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    tenantHost: tenant && tenant.attributes.host,
    tenantOrganizationType:
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      tenant && tenant.attributes.settings.core.organization_type,
    tenantLifecycleStage:
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      tenant && tenant.attributes.settings.core.lifecycle_stage,
  };
}

export function trackPage(path: string, properties = {}) {
  pageChanges$.next({
    properties,
    path,
  });
}

/** Tracks a virtual page view — for user actions that don't trigger a real
 * navigation but should be recorded as page views (e.g. auth flow steps,
 * survey form pages, SSO clicks). */
export function trackVirtualPageView(path: string) {
  virtualPageViews$.next(path);
}

type Properties = Record<string, string | number | boolean | undefined | null>;

export function trackEventByName(
  eventName: string,
  properties: Properties = {}
) {
  events$.next({
    properties,
    name: eventName,
  });
}

/** Events that are safe to share with the customer's own analytics. Besides
 * our tools, these events are pushed to the Google Tag Manager dataLayer,
 * where customers build triggers and conversions on them. Treat them as a
 * public contract: don't rename them, fire them only once an action has
 * succeeded, and only pass ids, never personal data or free text.
 *
 * Names are snake_case because customers usually forward them from GTM to
 * GA4 unchanged, and GA4 event names may only contain letters, numbers and
 * underscores. `login` and `sign_up` use GA4's recommended event names (with
 * its `method` parameter) so they line up with GA4's own reporting. */
const customerAnalyticsEvents = [
  'idea_started',
  'idea_submitted',
  'survey_started',
  'survey_submitted',
  'comment_posted',
  'reaction_added',
  'voting_started',
  'voting_submitted',
  'poll_submitted',
  'volunteered',
  'event_attendance_registered',
  'idea_followed',
  'project_followed',
  'login',
  'sign_up',
] as const;

type CustomerAnalyticsEvent = (typeof customerAnalyticsEvents)[number];

export const isCustomerAnalyticsEvent = (
  eventName: string
): eventName is CustomerAnalyticsEvent =>
  customerAnalyticsEvents.some((name) => name === eventName);

export function trackCustomerAnalyticsEvent(
  eventName: CustomerAnalyticsEvent,
  properties: Properties = {}
) {
  trackEventByName(eventName, properties);
}
