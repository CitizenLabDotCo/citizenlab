import { IAppConfiguration } from 'api/app_configuration/types';

import { tenantInfo, IEvent } from 'utils/analytics';
import { getRoutePattern } from 'utils/getRoutePattern';
import { getUrlLocale } from 'utils/getUrlLocale';
import { isNilOrError } from 'utils/helperUtils';

import { getProjectId } from './getProjectId';

export const trackEvent = (
  event: IEvent,
  appConfiguration: IAppConfiguration
) => {
  if (!isNilOrError(appConfiguration) && window._paq) {
    const properties = {
      ...tenantInfo(appConfiguration.data),
      ...event.properties,
    };
    window._paq.push([
      'trackEvent',
      event.name,
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      ...(Object.values(properties || {}) || []).filter(
        (item) => typeof item === 'string'
      ),
    ]);
  }
};

export const trackPageChange = async (path: string) => {
  if (!window._paq) return;

  // Update locale custom dimension if URL contains locale
  const locale = getUrlLocale(path);

  if (locale) {
    window._paq.push(['setCustomDimension', 3, locale]);
  }

  // Update project id custom dimension if URL is associated
  // with project
  const projectId = await getProjectId(path);

  if (projectId) {
    window._paq.push(['setCustomDimension', 4, projectId]);
  } else {
    window._paq.push(['setCustomDimension', 4]);
  }

  // Set custom URL (override default behavior)
  window._paq.push(['setCustomUrl', path]);

  // Match route pattern using TanStack Router
  const routePattern = getRoutePattern(path);

  if (routePattern) {
    window._paq.push(['trackPageView', routePattern]);
  } else {
    window._paq.push(['trackPageView']);
  }
};
