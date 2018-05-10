import React from 'react';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { mapValues } from 'lodash';
import { currentTenantStream, ITenantData } from 'services/tenant';
import { authUserStream } from 'services/auth';
import snippet from '@segment/snippet';
import { CL_SEGMENT_API_KEY } from 'containers/App/constants';
import { isAdmin } from 'services/permissions/roles';

interface IEvent {
  name: string;
  properties?: {
    [key: string]: any,
  };
}

interface IIdentification {
  userId: string;
  properties?: {
    [key: string]: any,
  };
}

interface IPageChange {
  name: string;
  properties?: {
    [key: string]: any,
  };
}

const tenant$ = currentTenantStream().observable;
const authUser$ = authUserStream().observable;
const events$ = new Subject<IEvent>();
const identifications$ = new Subject<IIdentification>();
const pageChanges$ = new Subject<IPageChange>();

Observable.combineLatest(tenant$, events$).subscribe(([tenant, event]) => {
  if (window && window['analytics']) {
    window['analytics'].track(
      event.name,
      addTenantInfo(event.properties, tenant.data),
    );
  }
});

Observable.combineLatest(tenant$, pageChanges$).subscribe(([tenant, pageChange]) => {
  if (window && window['analytics']) {
    window['analytics'].page(
      pageChange.name,
      addTenantInfo(pageChange.properties, tenant.data),
    );
  }
});

Observable.combineLatest(tenant$, identifications$).subscribe(([tenant, identification]) => {
  if (window && window['analytics']) {
    window['analytics'].identify(
      identification.userId,
      addTenantInfo(identification.properties, tenant.data),
    );

    window['analytics'].group(
      tenant && tenant.data.id,
      tenant && {
        name: tenant.data.attributes.name,
        host: tenant.data.attributes.host,
        type: tenant.data.attributes.settings.core.organization_type
      }
    );
  }
});

authUser$.subscribe((authUser) => {
  if (window && window['analytics']) {
    const userId = (authUser ? authUser.data.id : '');
    const hideMessenger = (authUser ? !isAdmin(authUser) : true);
    window['analytics'].identify(userId, {}, { Intercom: { hideDefaultLauncher: hideMessenger } });
  }
});

export function addTenantInfo(properties, tenant: ITenantData) {
  return {
    ...properties,
    tenantId: tenant && tenant.id,
    tenantName: tenant && tenant.attributes.name,
    tenantHost: tenant && tenant.attributes.host,
    tenantOrganizationType: tenant && tenant.attributes.settings.core.organization_type,
  };
}

export function trackPage(path: string, properties: {} = {}) {
  pageChanges$.next({
    properties,
    name: path
  });
}

export function trackIdentification(userId: string, properties: {} = {}) {
  identifications$.next({
    userId,
    properties,
  });
}

export function trackEventByName(eventName: string, properties: {} = {}) {
  events$.next({
    properties,
    name: eventName,
  });
}

export function trackEvent(event: IEvent) {
  events$.next({
    properties: (event.properties || {}),
    name: event.name,
  });
}

export const injectTracks = <P>(events: {[key: string]: IEvent}) => (component: React.ComponentClass<P>) => {
  return (props: P) => {
    const eventFunctions = mapValues(events, (event) => (
      (extra) => {
        const extraProps = extra && extra.extra;
        trackEventByName(event.name, { ...event.properties, ...extraProps });
      }
    ));
    const propsWithEvents = {
      ...eventFunctions,
      ...props as any,
    };

    const wrappedComponent = React.createElement(component, propsWithEvents);

    return wrappedComponent;
  };
};

export const initializeAnalytics = () => {
  // Initialize segments window.analytics object
  const contents = snippet.min({
    host: 'cdn.segment.com',
    apiKey: CL_SEGMENT_API_KEY,
  });

  // tslint:disable-next-line:no-eval
  eval(contents);
};
