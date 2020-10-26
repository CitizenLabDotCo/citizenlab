import React from 'react';
import { Subject, combineLatest } from 'rxjs';
import { mapValues, isFunction, get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { currentTenantStream, ITenantData } from 'services/tenant';
import { authUserStream } from 'services/auth';
import snippet from '@segment/snippet';
import {
  INTERCOM_APP_ID,
  SATISMETER_WRITE_KEY,
} from 'containers/App/constants';

import {
  isAdmin,
  isSuperAdmin,
  isProjectModerator,
} from 'services/permissions/roles';
import { IUser } from 'services/users';
import eventEmitter from 'utils/eventEmitter';
import { getConsent } from 'components/ConsentManager/consent';
import { IDestination } from 'components/ConsentManager/destinations';

export interface IEvent {
  name: string;
  properties?: {
    [key: string]: any;
  };
}

export interface IPageChange {
  path: string;
  properties?: {
    [key: string]: any;
  };
}

const tenant$ = currentTenantStream().observable;
const authUser$ = authUserStream().observable;
const events$ = new Subject<IEvent>();
const pageChanges$ = new Subject<IPageChange>();

const initializeTacking$ = eventEmitter.observeEvent<IDestination[]>(
  'initializeTacking'
);

combineLatest(tenant$, authUser$, initializeTacking$).subscribe(
  ([tenant, user, { eventValue }]) => {
    const { savedChoices } = getConsent();
    if (savedChoices.intercom && eventValue.includes('intercom')) {
      (function () {
        const w = window;
        const ic = w.Intercom;
        if (typeof ic === 'function') {
          ic('reattach_activator');
          ic('update', w.intercomSettings);
        } else {
          const d = document;
          const i = function () {
            i.c(arguments);
          };
          i.q = [];
          i.c = function (args) {
            i.q.push(args);
          };
          w.Intercom = i;
          const l = function () {
            const s = d.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = `https://widget.intercom.io/widget/'${INTERCOM_APP_ID}`;
            const x = d.getElementsByTagName('script')[0];
            x.parentNode?.insertBefore(s, x);
          };
          if (document.readyState === 'complete') {
            l();
          } else if (w.attachEvent) {
            w.attachEvent('onload', l);
          } else {
            w.addEventListener('load', l, false);
          }
        }
      })();

      window.Intercom &&
        window.Intercom('boot', {
          app_id: INTERCOM_APP_ID,
          ...(!isNilOrError(user)
            ? {
                email: user.data.attributes.email,
                user_id: user.data.id,
                name: `${user.data.attributes.first_name} + ${user.data.attributes.last_name}`,
              }
            : {}),
          ...(!isNilOrError(tenant)
            ? {
                company: {
                  company_id: tenant.data.id,
                  name: tenant.data.attributes.name,
                },
              }
            : {}),
        });
    }

    if (savedChoices.satismeter && eventValue.includes('satismeter')) {
      (function () {
        window.satismeter =
          window.satismeter ||
          function () {
            (window.satismeter.q = window.satismeter.q || []).push(arguments);
          };
        window.satismeter.l = new Date();
        const script = document.createElement('script');
        const parent = document.getElementsByTagName('script')[0].parentNode;
        script.async = true;
        script.src = 'https://app.satismeter.com/satismeter.js';
        script.onload = () =>
          window.satismeter({
            writeKey: SATISMETER_WRITE_KEY,
            ...(!isNilOrError(user)
              ? {
                  userId: user.data.id,
                  traits: {
                    name: `${user.data.attributes.first_name} + ${user.data.attributes.last_name}`,
                    email: user.data.attributes.email,
                    createdAt: user.data.attributes.created_at,
                  },
                }
              : {}),
          });
        parent?.appendChild(script);
      })();
    }
    if (
      savedChoices.google_tag_manager &&
      eventValue.includes('google_tag_manager')
    ) {
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        const f = d.getElementsByTagName(s)[0];
        const j = d.createElement(s) as HTMLScriptElement;
        const dl = l !== 'dataLayer' ? `&l=${l}` : '';
        j.async = true;
        j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
        f.parentNode?.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', 'GTM-KBM5894');
    }

    if (
      savedChoices.google_analytics &&
      eventValue.includes('google_analytics')
    ) {
      const script = document.createElement('script');
      const parent = document.getElementsByTagName('script')[0].parentNode;
      script.async = true;
      script.src =
        'https://www.googletagmanager.com/gtag/js?id=UA-101738826-16';
      parent?.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer?.push(arguments);
      }
      // @ts-ignore
      gtag('js', new Date());
      // @ts-ignore
      gtag('config', 'UA-101738826-16');
    }
    // shutdown
    if (!eventValue.includes('intercom') && window.Intercom) {
      window.Intercom('shutdown');
    }
  }
);

combineLatest(tenant$, authUser$, events$).subscribe(
  ([tenant, user, event]) => {
    if (!isNilOrError(tenant)) {
      window.Intercom &&
        window.Intercom('trackEvent', event.name, event.properties);
      window.satismeter && window.satismeter('track', { event: event.name });
      if (isFunction(get(window, 'analytics.track'))) {
        analytics.track(
          event.name,
          {
            ...tenantInfo(tenant.data),
            location: window?.location?.pathname,
            ...event.properties,
          },
          { integrations: integrations(user) }
        );
      }
    }
  }
);

combineLatest(tenant$, authUser$, pageChanges$).subscribe(
  ([tenant, user, pageChange]) => {
    window.Intercom &&
      window.Intercom('update', {
        last_request_at: new Date().getTime() / 1000,
      });
    if (!isNilOrError(tenant) && isFunction(get(window, 'analytics.page'))) {
      analytics.page(
        '',
        {
          path: pageChange.path,
          url: `https://${tenant.data.attributes.host}${pageChange.path}`,
          title: null,
          ...tenantInfo(tenant.data),
          ...pageChange.properties,
        },
        { integrations: integrations(user) }
      );
    }
  }
);

combineLatest(tenant$, authUser$).subscribe(([tenant, user]) => {
  if (
    !isNilOrError(tenant) &&
    isFunction(get(window, 'analytics.identify')) &&
    isFunction(get(window, 'analytics.group'))
  ) {
    if (user) {
      analytics.identify(
        user.data.id,
        {
          ...tenantInfo(tenant.data),
          email: user.data.attributes.email,
          firstName: user.data.attributes.first_name,
          lastName: user.data.attributes.last_name,
          createdAt: user.data.attributes.created_at,
          avatar: user.data.attributes.avatar
            ? user.data.attributes.avatar.large
            : null,
          birthday: user.data.attributes.birthyear,
          gender: user.data.attributes.gender,
          locale: user.data.attributes.locale,
          isSuperAdmin: isSuperAdmin(user),
          isAdmin: isAdmin(user),
          isProjectModerator: isProjectModerator(user),
          highestRole: user.data.attributes.highest_role,
        },
        {
          integrations: integrations(user),
          Intercom: { hideDefaultLauncher: !isAdmin(user) },
        } as any
      );
      analytics.group(
        tenant.data.id,
        {
          ...tenantInfo(tenant.data),
          name: tenant.data.attributes.name,
          website: tenant.data.attributes.settings.core.organization_site,
          avatar:
            tenant.data.attributes.logo && tenant.data.attributes.logo.medium,
          tenantLocales: tenant.data.attributes.settings.core.locales,
        },
        { integrations: integrations(user) }
      );
    } else {
      // no user
      analytics.identify(tenantInfo(tenant.data), {
        integrations: integrations(user),
        Intercom: { hideDefaultLauncher: true },
      } as any);
    }
  }
});

export function tenantInfo(tenant: ITenantData) {
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

export function integrations(user: IUser | null) {
  const output = {
    Intercom: false,
    SatisMeter: false,
  };
  if (user) {
    const highestRole = user.data.attributes.highest_role;
    output['Intercom'] =
      highestRole === 'admin' || highestRole === 'project_moderator';
    output['SatisMeter'] =
      highestRole === 'admin' || highestRole === 'project_moderator';
  }
  return output;
}

export function trackPage(path: string, properties: {} = {}) {
  pageChanges$.next({
    properties,
    path,
  });
}

// Use this function, trackEvent/injectTracks will get factored out in the future
export function trackEventByName(eventName: string, properties: {} = {}) {
  events$.next({
    properties,
    name: eventName,
  });
}

export function trackEvent(event: IEvent) {
  events$.next({
    properties: event.properties || {},
    name: event.name,
  });
}

export const injectTracks = <P>(events: { [key: string]: IEvent }) => (
  component: React.ComponentClass<P>
) => {
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

export const initializeAnalytics = () => {
  // Initialize segments window.analytics object
  const contents = snippet.min({
    host: 'cdn.segment.com',
    load: false,
    page: false,
  });

  // tslint:disable-next-line:no-eval
  eval(contents);

  trackPage(window.location.pathname);
};
