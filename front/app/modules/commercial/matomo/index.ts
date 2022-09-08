import { combineLatest } from 'rxjs';

// services
import { authUserStream } from 'services/auth';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { getUrlLocale } from 'services/locale';

// routes
import createRoutes from 'routes';
import matchPath, { getAllPathsFromRoutes } from './matchPath';

// utils
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
import { setupMatomo } from './setup';

// typings
import { ModuleConfiguration } from 'utils/moduleUtils';

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

    function trackMatomoPageView(path: string) {
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
      setupMatomo(appConfiguration, user);
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
        trackMatomoPageView(pageChange.path);
      }
    });

    registerDestination(destinationConfig);
  },
};

export default configuration;
