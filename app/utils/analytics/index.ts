import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs';
import { observeCurrentTenant, ITenantData } from 'services/tenant';

interface IEvent {
  name: string,
  properties?: {
    [key: string]: any,
  },
}

const tenant$ = observeCurrentTenant().observable;
const events$ = new Rx.Subject<IEvent>();
const pageChanges$ = new Rx.Subject<string>();


Rx.Observable.combineLatest(tenant$, events$)
  .subscribe(([tenant, event]) => {
    (<any>window).analytics.track(
      event.name,
      addTenantInfo(event.properties, tenant.data),
    );
  });

Rx.Observable.combineLatest(tenant$, pageChanges$)
  .subscribe(([tenant, pagePath]) => {
    (<any>window).analytics.track(
      pagePath,
      addTenantInfo({}, tenant.data),
    );
  });


export function addTenantInfo(properties, tenant: ITenantData) {
  return {
    ...properties,
    tenantId: tenant && tenant.id,
    tenantName: tenant && tenant.attributes.name,
    tenantHost: tenant && tenant.attributes.host,
  };
}

export function trackPage(path) {
  pageChanges$.next(path);
}

/** HOC that allows specifying events as function props to the inner component
 e.g.:
 const SomeComponent = ({ buttonClicked }) => <button onClick={buttonClicked} />);
 const TrackedComponent = injectTracks(
   {trackButtonClick: {name: 'Button clicked'}}
  )(SomeComponent);
*/
export const injectTracks = (events: {[key: string]: IEvent}) => (component: React.ComponentClass) => {
  return (props) => {

    const eventFunctions = _.mapValues(events, (event) => (
      (extra) => {
        const extraProps = extra && extra.extra;
        events$.next({name: event.name, properties: {...event.properties, ...extraProps}})
      }
    ));
    const propsWithEvents = {
      ...eventFunctions,
      ...props,
    }
    return React.createElement(component, propsWithEvents);
  }
};
