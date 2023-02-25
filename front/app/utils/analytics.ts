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
import { isEqual } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';

import {
  IAppConfigurationData,
  currentAppConfigurationStream,
} from 'services/appConfiguration';

import {
  getDestinationConfig,
  IDestination,
  isDestinationActive,
} from 'components/ConsentManager/destinations';
import { ISavedDestinations } from 'components/ConsentManager/consent';
import { authUserStream } from 'services/auth';

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
    currentAppConfigurationStream().observable,
    authUserStream().observable,
  ]).pipe(
    filter(([consent, tenant, user]) => {
      const config = getDestinationConfig(destination);

      return (
        consent.eventValue[destination] &&
        (!config || isDestinationActive(config, tenant.data, user?.data))
      );
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
    currentAppConfigurationStream().observable,
    authUserStream().observable,
  ]).pipe(
    map(([consent, tenant, user]) => {
      const config = getDestinationConfig(destination);
      return (
        consent.eventValue[destination] &&
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
    tenantId: tenant && tenant.id,
    tenantName: tenant && tenant.attributes.name,
    tenantHost: tenant && tenant.attributes.host,
    tenantOrganizationType:
      tenant && tenant.attributes.settings.core.organization_type,
    tenantLifecycleStage:
      tenant && tenant.attributes.settings.core.lifecycle_stage,
  };
}

export function trackPage(path: string, properties = {}) {
  pageChanges$.next({
    properties,
    path,
  });
}

export function trackEventByName(eventName: string, properties = {}) {
  events$.next({
    properties,
    name: eventName,
  });
}
