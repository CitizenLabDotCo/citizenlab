import { combineLatest } from 'rxjs';

import appConfigurationStream from 'api/app_configuration/appConfigurationStream';
import authUserStream from 'api/me/authUserStream';

import {
  IDestinationConfig,
  registerDestination,
} from 'components/ConsentManager/destinations';

import {
  bufferUntilInitialized,
  events$,
  initializeFor,
  pageChanges$,
  shutdownFor,
} from 'utils/analytics';
import { ModuleConfiguration } from 'utils/moduleUtils';

import { trackEvent, trackPageChange } from './actions';
import { setupMatomo } from './setup';

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
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
      appConfigurationStream,
      authUserStream,
      initializeFor('matomo'),
    ]).subscribe(([appConfiguration, user, _]) => {
      if (appConfiguration) {
        setupMatomo(appConfiguration, user || null);
      }
    });

    // Disable matomo tracking when necessary
    shutdownFor('matomo').subscribe(() => {
      window._paq = undefined;
    });

    // Subscribe to new events and app configuration changes
    // and post to Matomo
    combineLatest([
      bufferUntilInitialized('matomo', events$),
      appConfigurationStream,
    ]).subscribe(([event, appConfiguration]) => {
      if (appConfiguration) {
        trackEvent(event, appConfiguration);
      }
    });

    // Subscribe to new page changes and app configuration changes
    // and post to Matomo
    combineLatest([
      bufferUntilInitialized('matomo', pageChanges$),
      appConfigurationStream,
    ]).subscribe(([pageChange, _]) => {
      trackPageChange(pageChange.path);
    });

    registerDestination(destinationConfig);
  },
};

export default configuration;
