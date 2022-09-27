import { combineLatest } from 'rxjs';

// services
import { authUserStream } from 'services/auth';
import { currentAppConfigurationStream } from 'services/appConfiguration';

// utils
import {
  bufferUntilInitialized,
  events$,
  initializeFor,
  pageChanges$,
  shutdownFor,
} from 'utils/analytics';
import {
  IDestinationConfig,
  registerDestination,
} from 'components/ConsentManager/destinations';
import { setupMatomo } from './setup';
import { trackEvent, trackPageChange } from './actions';

// typings
import { ModuleConfiguration } from 'utils/moduleUtils';

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
    // Subscribe to changes in app configuration, users
    // and matomo enabled state
    combineLatest([
      currentAppConfigurationStream().observable,
      authUserStream().observable,
      initializeFor('matomo'),
    ]).subscribe(([appConfiguration, user, _]) => {
      setupMatomo(appConfiguration, user);
    });

    // Disable matomo tracking when necessary
    shutdownFor('matomo').subscribe(() => {
      window._paq = undefined;
    });

    // Subscribe to new events and app configuration changes
    // and post to Matomo
    combineLatest([
      bufferUntilInitialized('matomo', events$),
      currentAppConfigurationStream().observable,
    ]).subscribe(([event, appConfiguration]) => {
      trackEvent(event, appConfiguration);
    });

    // Subscribe to new page changes and app configuration changes
    // and post to Matomo
    combineLatest([
      bufferUntilInitialized('matomo', pageChanges$),
      currentAppConfigurationStream().observable,
    ]).subscribe(([pageChange, _]) => {
      trackPageChange(pageChange.path);
    });

    registerDestination(destinationConfig);
  },
};

export default configuration;
