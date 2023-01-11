import React from 'react';
import { Subject } from 'rxjs';

import { mapValues } from 'lodash-es';

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
