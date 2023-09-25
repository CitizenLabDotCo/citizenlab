// routes
import createRoutes from 'routes';
import matchPath, { getAllPathsFromRoutes } from './matchPath';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { tenantInfo, IEvent } from 'utils/analytics';
import { getUrlLocale } from 'utils/locale';
import { getProjectId } from './getProjectId';

// typings
import { IAppConfiguration } from 'api/app_configuration/types';

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
