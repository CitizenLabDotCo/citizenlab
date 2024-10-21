import { IAppConfiguration } from 'api/app_configuration/types';
import { IUser } from 'api/users/types';

import { isNilOrError } from 'utils/helperUtils';

const MATOMO_HOST = process.env.MATOMO_HOST || '//matomo.hq.citizenlab.co';

export const setupMatomo = (
  appConfiguration: IAppConfiguration,
  user: IUser | null
) => {
  // Don't set up tracking if no host or site_id found
  if (!MATOMO_HOST) return;
  if (
    !appConfiguration.data.attributes.settings.matomo?.product_site_id &&
    appConfiguration.data.attributes.settings.matomo?.tenant_site_id
  ) {
    return;
  }

  window._paq = window._paq || [];

  // Logout / login
  if (!isNilOrError(user)) {
    window._paq.push(['setUserId', user.data.id]);
  } else {
    window._paq.push(['resetUserId']);
  }

  // Setup Matomo, all these _paq vars only need initialising once (before matomo.js is loaded)
  if (Array.isArray(window._paq)) {
    (function () {
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

      // Configure tracking to the global site used for product analytics
      if (appConfiguration.data.attributes.settings.matomo?.product_site_id) {
        window._paq.push(['setTrackerUrl', `${MATOMO_HOST}/matomo.php`]);
        window._paq.push([
          'setSiteId',
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          appConfiguration.data.attributes.settings.matomo?.product_site_id,
        ]);
      }
      // Configure tracking data to the tenant-specific site
      if (appConfiguration.data.attributes.settings.matomo?.tenant_site_id) {
        window._paq.push([
          'addTracker',
          `${MATOMO_HOST}/matomo.php`,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          appConfiguration.data.attributes.settings.matomo?.tenant_site_id,
        ]);
      }

      // Tenant name & Tenant ID custom fields - stored at visit level
      if (!isNilOrError(appConfiguration)) {
        window._paq.push([
          'setCustomDimension',
          1,
          appConfiguration.data.attributes.name,
        ]);
        window._paq.push(['setCustomDimension', 2, appConfiguration.data.id]);
      }

      // Attach Matomo tracker
      const d = document;
      const g = d.createElement('script');
      const s = d.getElementsByTagName('script')[0];
      g.type = 'text/javascript';
      g.async = true;
      g.src = `${MATOMO_HOST}/matomo.js`;
      g.id = 'internal_matomo_analytics';
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      s?.parentNode?.insertBefore(g, s);
    })();
  }
};
