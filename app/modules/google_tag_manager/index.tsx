import React from 'react';
import {
  IDestinationConfig,
  registerDestination,
} from 'components/ConsentManager/destinations';
import { initializeFor } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { combineLatest } from 'rxjs';
import { currentAppConfigurationStream } from 'services/tenant';
import { isNilOrError } from 'utils/helperUtils';
import { ModuleConfiguration } from 'utils/moduleUtils';

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    google_tag_manager: 'google_tag_manager';
  }
}

const destinationConfig: IDestinationConfig = {
  key: 'google_tag_manager',
  category: 'analytics',
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
      currentAppConfigurationStream().observable,
      initializeFor('google_tag_manager'),
    ]).subscribe(([tenant, _]) => {
      if (isNilOrError(tenant)) return;

      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        const f = d.getElementsByTagName(s)[0];
        const j = d.createElement(s) as HTMLScriptElement;
        const dl = l !== 'dataLayer' ? `&l=${l}` : '';
        j.async = true;
        j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
        f.parentNode?.insertBefore(j, f);
      })(
        window,
        document,
        'script',
        'dataLayer',
        tenant.data.attributes.settings.google_tag_manager?.container_id
      );
    });

    registerDestination(destinationConfig);
  },
};

export default configuration;
