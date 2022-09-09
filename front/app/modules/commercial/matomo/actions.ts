// services
import { projectBySlugStream, IProject } from 'services/projects';

// routes
import createRoutes from 'routes';
import matchPath, { getAllPathsFromRoutes } from './matchPath';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { tenantInfo, IEvent } from 'utils/analytics';
import { getUrlLocale } from 'services/locale';
import { slugRegEx } from 'utils/textUtils';

// typings
import { Subscription } from 'rxjs';
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

  // Update project id custom dimension if project page
  if (isProjectPage(path)) {
    const slug = extractProjectSlug(path)
    if (!slug) return;

    const projectId = await getProjectId(slug);
    subscriptions[slug].unsubscribe();
    
    window._paq.push(['setCustomDimension', 4, projectId])
  } else {
    window._paq.push(['setCustomDimension', 4, undefined])
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

const slugRegExSource = slugRegEx.source
  .slice(1, slugRegEx.source.length - 2)

const projectPageDetectRegex = RegExp(`\/projects\/(${slugRegExSource})`);
const projectPageExtractRegex = /\/projects\/([^\s!?\/.*#|]+)/;

const isProjectPage = (path: string) => {
  return projectPageDetectRegex.test(path);
}

const extractProjectSlug = (path: string) => {
  const matches = path.match(projectPageExtractRegex);
  return matches && matches[1];
}

const subscriptions: Record<string, Subscription> = {};

const getProjectId = (slug: string) => {
  return new Promise((resolve, reject) => {
    const observable = projectBySlugStream(slug).observable

    subscriptions[slug] = observable.subscribe((project: IProject | NilOrError) => {
      if (isNilOrError(project)) {
        reject(project)
      } else {
        resolve(project.data.id)
      }
    })
  })
}