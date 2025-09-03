import createRoutes from 'routes';

import authUserStream from 'api/me/authUserStream';

import { API_PATH, locales } from 'containers/App/constants';

import { pageChanges$ } from 'utils/analytics';
import { getJwt } from 'utils/auth/jwt';
import fetcher from 'utils/cl-react-query/fetcher';
import matchPath, { getAllPathsFromRoutes } from 'utils/matchPath';
import { ModuleConfiguration } from 'utils/moduleUtils';

let sessionId: string | undefined;
let allAppPaths: string[] | undefined;
let previousPathTracked: string | undefined;
let sessionTracked = false;

const trackSessionStarted = async (path: string) => {
  // eslint-disable-next-line
  const referrer = document.referrer ?? window.frames?.top?.document.referrer;

  const jwt = getJwt();

  const response = await fetch(`${API_PATH}/sessions`, {
    method: 'POST',
    body: JSON.stringify({
      session: {
        referrer,
      },
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });

  // If the user is a bot, we will get a 204 (no content) response.
  // In this case, we can't track the session.
  if (response.status === 204) {
    return;
  }

  const data = await response.json();

  // In some cases, we don't get data back.
  // Not sure why, but we can't track the session in this case.
  sessionId = data?.data?.id;

  // Because the first page view depends on the response of the session creation,
  // we handle it here and ignore the first page view event (see below).
  trackPageView(path);
};

const upgradeSession = () => {
  fetcher({
    path: `/sessions/current/upgrade`,
    action: 'patch',
    body: {},
  });
};

const trackPageView = async (path: string) => {
  if (allAppPaths === undefined) {
    allAppPaths = getAllPathsFromRoutes(createRoutes()[0]);
  }

  // For some reason, sometimes the page view event is triggered twice
  // for the same path. This prevents that.
  if (previousPathTracked === path) return;

  // We also only start tracking page views after the session has been created.
  if (sessionId === undefined) return;

  previousPathTracked = path;

  const routeMatch = matchPath(path, {
    paths: allAppPaths,
    exact: true,
  });

  const route = routeMatch?.path;

  await fetcher({
    path: `/sessions/${sessionId}/track_pageview`,
    action: 'post',
    body: {
      pageview: {
        client_path: path,
        route,
      },
    },
  });
};

const stripPath = (path: string) => {
  if (path.length < 2) return path;
  if (path.endsWith('/')) return path.slice(0, -1);
  return path;
};

const hasLocale = (path: string) => {
  for (const locale of locales) {
    if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
      return true;
    }
  }

  return false;
};

let userWasAuthenticated = !!getJwt();

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    pageChanges$.subscribe((e) => {
      // We remove the trailing slash from the path,
      // so that we don't track e.g. /en and /en/ as two different paths.
      const strippedPath = stripPath(e.path);

      if (hasLocale(strippedPath)) {
        if (!sessionTracked) {
          trackSessionStarted(strippedPath); // This will also track the first page view
          sessionTracked = true;
        } else {
          trackPageView(strippedPath);
        }
      }
    });

    authUserStream.subscribe(() => {
      const userIsAuthenticated = !!getJwt();

      // If the user was not authenticated, but now they are, trigger upgrade
      if (!userWasAuthenticated && userIsAuthenticated) {
        upgradeSession();
      }

      userWasAuthenticated = userIsAuthenticated;
    });
  },
};

export default configuration;
