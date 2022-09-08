// routes
import createRoutes from 'routes';
import matchPath, { getAllPathsFromRoutes } from './matchPath';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { tenantInfo, IEvent } from 'utils/analytics';
import { getUrlLocale } from 'services/locale';

// typings
import { IAppConfiguration } from 'services/appConfiguration';

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

export const trackPageChange = (path: string) => {
  if (!window._paq) return;

  if (allAppPaths === undefined) {
    allAppPaths = getAllPathsFromRoutes(createRoutes()[0]);
  }

  // Update locale custom dimension if URL contains locale
  const locale = getUrlLocale(path);

  if (locale) {
    window._paq.push(['setCustomDimension', 3, locale]);
  }

  // Update project id custom dimension if project page
  if (isProjectPage(path)) {
    const slug = extractProjectSlug(path)
    console.log(slug)
  }

  // TODO ideas

  // Set custom URL (override default behavior)
  window._paq.push(['setCustomUrl', path]);

  // Sort out path and params for this pathname
  const routeMatch = matchPath(path, {
    path: allAppPaths,
    exact: true,
  });

  if (routeMatch?.isExact) {
    window._paq.push(['trackPageView', routeMatch.path]);
  } else {
    window._paq.push(['trackPageView']);
  }
};

const projectPageRegex = /\/projects\/([^\s!?\/.*#|]+)/;

const isProjectPage = (path: string) => {
  return projectPageRegex.test(path);
}

const extractProjectSlug = (path: string) => {
  const matches = path.match(projectPageRegex);
  return matches && matches[1];
}