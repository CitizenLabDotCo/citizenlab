import { combineLatest } from 'rxjs';

import appConfigurationStream from 'api/app_configuration/appConfigurationStream';

import {
  IDestinationConfig,
  registerDestination,
} from 'components/ConsentManager/destinations';

import { initializeFor, shutdownFor } from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';
import { ModuleConfiguration } from 'utils/moduleUtils';

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    google_analytics: 'google_analytics';
  }
}

const destinationConfig: IDestinationConfig = {
  key: 'google_analytics',
  category: 'analytics',
  feature_flag: 'google_analytics',
  name: () => 'Google Analytics',
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    // Initialize
    combineLatest([
      appConfigurationStream,
      initializeFor('google_analytics'),
    ]).subscribe(([tenant, _]) => {
      if (isNilOrError(tenant)) return;

      const currdate: any = new Date();
      const gaNewElem: any = {};
      const gaElems: any = {};

      // This code is from Google, so let's not modify it too much, just add gaNewElem and gaElems:

      (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        (i[r] =
          i[r] ||
          function () {
            // eslint-disable-next-line prefer-rest-params
            (i[r].q = i[r].q || []).push(arguments);
          }),
          (i[r].l = 1 * currdate);
        // eslint-disable-next-line no-param-reassign
        (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
        a.async = 1;
        a.src = g;
        m?.parentNode?.insertBefore(a, m);
      })(
        window,
        document,
        'script',
        '//www.google-analytics.com/analytics.js',
        'ga',
        gaNewElem,
        gaElems
      );
      /* tslint:enable:no-unused-expression */
      /* tslint:enable:semicolon */
      /* tslint:enable:no-string-literal */

      (window as any).ga(
        'create',
        tenant.data.attributes.settings.google_analytics?.tracking_id,
        'auto'
      );
      (window as any).ga('send', 'pageview');
    });

    // Shutdown
    combineLatest([
      appConfigurationStream,
      shutdownFor('google_analytics'),
    ]).subscribe(([tenant, _]) => {
      if (tenant) {
        window[
          `ga-disable-${tenant.data.attributes.settings.google_analytics?.tracking_id}`
        ];
      }
    });

    registerDestination(destinationConfig);
  },
};

export default configuration;
