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
