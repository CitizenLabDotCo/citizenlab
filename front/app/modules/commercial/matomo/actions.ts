import createRoutes from 'routes';

import { IAppConfiguration } from 'api/app_configuration/types';

import { tenantInfo, IEvent } from 'utils/analytics';
import { getUrlLocale } from 'utils/getUrlLocale';
import { isNilOrError } from 'utils/helperUtils';
import matchPath, { getAllPathsFromRoutes } from 'utils/matchPath';

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

let allAppPaths: string[] | undefined;

export const trackPageChange = async (path: string) => {
  if (!window._paq) return;

  if (allAppPaths === undefined) {
    allAppPaths = getAllPathsFromRoutes(createRoutes()[0]);
  }

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

  // Sort out path and params for this pathname
  const routeMatch = matchPath(path, {
    paths: allAppPaths,
    exact: true,
  });

  if (routeMatch?.isExact) {
    window._paq.push(['trackPageView', routeMatch.path]);
  } else {
    window._paq.push(['trackPageView']);
  }
};
