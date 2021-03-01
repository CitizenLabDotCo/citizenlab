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
import { isAdmin, isModerator, isSuperAdmin } from 'services/permissions/roles';
import { ModuleConfiguration } from 'utils/moduleUtils';
import { removeUrlLocale } from 'services/locale';

// TODO MOTOMO_KEY
export const MATOMO_KEY = process.env.MATOMO_KEY;

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    matomo: 'matomo';
  }
}

const exp = new RegExp(
  '(?<before>^/(ideas|initiatives|projects|users|folders|workshops|admin/(projects(/(folders|templates))|emails/custom)?)/)(?<match>([A-Za-z0-9]|-)*)(?<after>/?(.*))',
  'g'
);

const destinationConfig: IDestinationConfig = {
  key: 'matomo',
  category: 'functional',
  feature_flag: 'matomo',
  name: () => 'Matomo',
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    combineLatest([
      currentAppConfigurationStream().observable,
      authUserStream().observable,
      initializeFor('matomo'),
    ]).subscribe(([tenant, user, _]) => {
      if (!MATOMO_KEY) return;
      // TODO init script

      /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
      const _paq = (window._paq = window._paq || []);

      _paq.push(['setDocumentTitle', document.domain + '/' + document.title]);
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function () {
        const u = 'https://citizenlab.matomo.cloud/';
        _paq.push(['setTrackerUrl', u + 'matomo.php']);
        _paq.push(['setSiteId', '1']);
        const d = document,
          g = d.createElement('script'),
          s = d.getElementsByTagName('script')[0];
        g.type = 'text/javascript';
        g.async = true;
        g.src = '//cdn.matomo.cloud/citizenlab.matomo.cloud/matomo.js';
        s.parentNode.insertBefore(g, s);

        // TODO try and load this if matomo script failed ? (IE user accepted and browser blocked)
        // <noscript
        //   ><p>
        //     <img
        //       src="https://citizenlab.matomo.cloud/matomo.php?idsite=1&amp;rec=1"
        //       style="border: 0;"
        //       alt=""
        //     /></p
        // ></noscript>
      })();

      if (!isNilOrError(tenant)) {
        window._paq.push([
          'setCustomDimension',
          1,
          tenant.data.attributes.name,
        ]);
        window._paq.push(['setCustomDimension', 2, tenant.data.id]);
      }
    });

    shutdownFor('matomo').subscribe(() => {
      // TODO sutdown script
      window._paq.push(['resetUserId']);
    });

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
          ...(Object.values(event.properties || {}) || []).filter(
            (item) => typeof item === 'string'
          ),
        ]);
      }
    });

    pageChanges$.subscribe((pageChange) => {
      if (window._paq) {
        // TODO get url from pagechange
        const unlocalizedPath = removeUrlLocale(pageChange.path);
        const pathParts = exp.exec(unlocalizedPath)?.groups;
        window._paq.push(['setCustomUrl', unlocalizedPath]);
        window._paq.push([
          'trackPageView',
          pathParts
            ? `${pathParts.before}identifier${pathParts.after}`
            : unlocalizedPath,
          pathParts ? { dimension4: pathParts.match } : undefined,
        ]);

        const content = document.getElementById('app');
        window._paq.push(['FormAnalytics::scanForForms', content]);
      }
    });

    registerDestination(destinationConfig);
  },
};

export default configuration;
