import React from 'react';

import { combineLatest } from 'rxjs';

import appConfigurationStream from 'api/app_configuration/appConfigurationStream';

import {
  IDestinationConfig,
  registerDestination,
} from 'components/ConsentManager/destinations';

import { initializeFor } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { ModuleConfiguration } from 'utils/moduleUtils';

import messages from './messages';
declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    google_tag_manager: 'google_tag_manager';
  }
}

const destinationConfig: IDestinationConfig = {
  key: 'google_tag_manager',
  category: (tenant) =>
    tenant.attributes.settings.google_tag_manager?.category || 'analytics',
  feature_flag: 'google_tag_manager',
  name: (tenant) => (
    <FormattedMessage
      {...messages.google_tag_manager}
      values={{
        destinations:
          tenant.attributes.settings.google_tag_manager?.destinations,
      }}
    />
  ),
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    combineLatest([
      appConfigurationStream,
      initializeFor('google_tag_manager'),
    ]).subscribe(([tenant, _]) => {
      if (isNilOrError(tenant)) return;

      const containerIdString =
        tenant.data.attributes.settings.google_tag_manager?.container_id || '';

      // Split by comma to support multiple container IDs
      const containerIds = containerIdString
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      // Initialize GTM for each container ID
      containerIds.forEach((containerId: string) => {
        // Check if GTM script for this container ID already exists
        const existingScript = document.querySelector(
          `script[src*="googletagmanager.com/gtm.js?id=${containerId}"]`
        );

        if (existingScript) return; // Skip if already loaded

        (function (w, d, s, l, i) {
          w[l] = w[l] || [];
          w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
          const f = d.getElementsByTagName(s)[0];
          const j = d.createElement(s) as HTMLScriptElement;
          const dl = l !== 'dataLayer' ? `&l=${l}` : '';
          j.async = true;
          j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          f?.parentNode?.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', containerId);
      });
    });

    registerDestination(destinationConfig);
  },
};

export default configuration;
