import { combineLatest } from 'rxjs';

import appConfigurationStream from 'api/app_configuration/appConfigurationStream';
import authUserStream from 'api/me/authUserStream';

import {
  IDestinationConfig,
  registerDestination,
} from 'components/ConsentManager/destinations';

import { initializeFor } from 'utils/analytics';
import { ModuleConfiguration } from 'utils/moduleUtils';

import { initializePosthog } from '../posthog_integration';

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    posthog: 'posthog';
  }
}

const destinationConfig: IDestinationConfig = {
  key: 'posthog',
  category: 'analytics',
  feature_flag: 'posthog_user_tracking',
  name: () => 'PostHog',
};

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    if (!POSTHOG_API_KEY) return;
    // Subscribe to changes in app configuration, users
    // and Posthog enabled state
    combineLatest([
      appConfigurationStream,
      authUserStream,
      initializeFor('posthog'),
    ]).subscribe(async ([appConfiguration, user, _]) => {
      if (appConfiguration) {
        await initializePosthog(
          POSTHOG_API_KEY,
          user ?? undefined,
          appConfiguration
        );
      }
    });

    registerDestination(destinationConfig);
  },
};

export default configuration;
