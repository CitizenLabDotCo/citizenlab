import { combineLatest } from 'rxjs';
import { authUserStream } from 'services/auth';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import {
  bufferUntilInitialized,
  events$,
  initializeFor,
  pageChanges$,
  shutdownFor,
  tenantInfo,
} from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';
import {
  IDestinationConfig,
  registerDestination,
} from 'components/ConsentManager/destinations';
import { ModuleConfiguration } from 'utils/moduleUtils';
import createRoutes from 'routes';
import matchPath, { getAllPathsFromRoutes } from './matchPath';
import { getUrlLocale } from 'services/locale';

export const MATOMO_HOST =
  process.env.MATOMO_HOST || '//matomo.hq.citizenlab.co';

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    matomo: 'matomo';
  }

  interface IConsentManagerFeatureMap {
    matomo: 'matomo';
  }
}

const destinationConfig: IDestinationConfig = {
  key: 'matomo',
  category: 'analytics',
  feature_flag: 'matomo',
  name: () => 'Matomo',
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    const allAppPaths = getAllPathsFromRoutes(createRoutes()[0]);

    function trackMatomoPageview(path) {
      const locale = getUrlLocale(path);
      locale && window._paq.push(['setCustomDimension', 3, locale]);
      window._paq.push(['setCustomUrl', path]);

      // sorts out path and params for this pathname
      const routeMatch = matchPath(path, {
        path: allAppPaths,
        exact: true,
      });

      if (routeMatch?.isExact) {
        window._paq.push(['trackPageView', routeMatch.path]);
      } else {
        window._paq.push(['trackPageView']);
      }
    }

    // Subscribe to changes in app configuration and users
    combineLatest([
      currentAppConfigurationStream().observable,
      authUserStream().observable,
      initializeFor('matomo'),
    ]).subscribe(([appConfiguration, user, _]) => {
      // Don't set up tracking if no host or site_id found
      if (!MATOMO_HOST) return;
      if (
        !appConfiguration.data.attributes.settings.matomo?.product_site_id &&
        appConfiguration.data.attributes.settings.matomo?.tenant_site_id
      ) {
        return;
      }

      /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
      window._paq = window._paq || [];

      if (!isNilOrError(user)) {
        window._paq.push(['setUserId', user.data.id]);
      } else {
        window._paq.push(['resetUserId']);
      }

      // Setup Matomo, but only do this initialisation once
      if (Array.isArray(window._paq)) {
        window._paq.push(['enableLinkTracking']);
        window._paq.push(['enableHeartBeatTimer']);
        window._paq.push([
          'setDomains',
          `${appConfiguration.data.attributes.host}/*`,
        ]);
        window._paq.push([
          'setCookieDomain',
          `${appConfiguration.data.attributes.host}/*`,
        ]);

        (function () {
          // Configure tracking to the global site used for product analytics
          if (
            appConfiguration.data.attributes.settings.matomo?.product_site_id
          ) {
            window._paq.push(['setTrackerUrl', `${MATOMO_HOST}/matomo.php`]);
            window._paq.push([
              'setSiteId',
              appConfiguration.data.attributes.settings.matomo?.product_site_id,
            ]);
          }
          // Configure tracking data to the tenant-specific site
          if (
            appConfiguration.data.attributes.settings.matomo?.tenant_site_id
          ) {
            window._paq.push([
              'addTracker',
              `${MATOMO_HOST}/matomo.php`,
              appConfiguration.data.attributes.settings.matomo?.tenant_site_id,
            ]);
          }

          const d = document;
          const g = d.createElement('script');
          const s = d.getElementsByTagName('script')[0];
          g.type = 'text/javascript';
          g.async = true;
          g.src = `${MATOMO_HOST}/matomo.js`;
          g.id = 'internal_matomo_analytics';
          s?.parentNode?.insertBefore(g, s);
        })();

        if (!isNilOrError(appConfiguration)) {
          window._paq.push([
            'setCustomDimension',
            1,
            appConfiguration.data.attributes.name,
          ]);
          window._paq.push(['setCustomDimension', 2, appConfiguration.data.id]);
        }
        trackMatomoPageview(window.location.pathname); // Track first path hit onload
      }
    });

    shutdownFor('matomo').subscribe(() => {
      window._paq = undefined;
    });

    // Subscribe to new events and post to Matomo
    combineLatest([
      bufferUntilInitialized('matomo', events$),
      currentAppConfigurationStream().observable,
    ]).subscribe(([event, tenant]) => {
      if (!isNilOrError(tenant) && window._paq) {
        const properties = {
          ...tenantInfo(tenant.data),
          ...event.properties,
        };
        window._paq.push([
          'trackEvent',
          event.name,
          ...(Object.values(properties || {}) || []).filter(
            (item) => typeof item === 'string'
          ),
        ]);
      }
    });

    // Subscribe to new path changes and post to Matomo
    combineLatest([
      bufferUntilInitialized('matomo', pageChanges$),
      currentAppConfigurationStream().observable,
    ]).subscribe(([pageChange, _]) => {
      if (window._paq) {
        trackMatomoPageview(pageChange.path);
      }
    });

    registerDestination(destinationConfig);
  },
};

export default configuration;
