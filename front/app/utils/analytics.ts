import React from 'react';
import { Subject, combineLatest } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { isEqual, mapValues } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';

import { currentAppConfigurationStream } from 'services/appConfiguration';

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

export function trackPage(path: string, properties = {}) {
  pageChanges$.next({
    properties,
    path,
  });
}

// Use this function, trackEvent/injectTracks will get factored out in the future
export function trackEventByName(eventName: string, properties = {}) {
  events$.next({
    properties,
    name: eventName,
  });
}

/** @deprecated Use `trackEventByName` instead */
export function trackEvent(event: IEvent) {
  events$.next({
    properties: event.properties || {},
    name: event.name,
  });
}

/** @deprecated Directly call trackEventByName instead */
export const injectTracks =
  <P extends Record<string, any>>(events: { [key: string]: IEvent }) =>
  (component: React.ComponentClass<P>) => {
    return (props: P) => {
      const eventFunctions = mapValues(events, (event) => (extra) => {
        const extraProps = extra && extra.extra;
        trackEventByName(event.name, { ...event.properties, ...extraProps });
      });

      const propsWithEvents = {
        ...eventFunctions,
        ...(props as any),
      };

      const wrappedComponent = React.createElement(component, propsWithEvents);

      return wrappedComponent;
    };
  };
