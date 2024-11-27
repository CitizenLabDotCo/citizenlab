import createRoutes from 'routes';

import { API_PATH } from 'containers/App/constants';

import { events$, pageChanges$ } from 'utils/analytics';
import { getJwt } from 'utils/auth/jwt';
import fetcher from 'utils/cl-react-query/fetcher';
import matchPath, { getAllPathsFromRoutes } from 'utils/matchPath';
import { ModuleConfiguration } from 'utils/moduleUtils';

const signUpInTracks = {
  signInEmailPasswordCompleted: 'Sign in - email & password sign-in completed',
  signUpFlowCompleted: 'Sign up flow completed',
};

let sessionId: string;
let allAppPaths: string[] | undefined;
let previousPathTracked: string;

const trackSessionStarted = async () => {
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

  const data = await response.json();
  sessionId = data.data.id;

  // Because the first page view depends on the response of the session creation,
  // we handle it here and ignore the first page view event (see below).
  trackPageView(window.location.pathname);
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

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    trackSessionStarted();

    pageChanges$.subscribe((e) => {
      // Ignore first page view event (only start tracking here after session creation)
      if (!sessionId) return;
      trackPageView(e.path);
    });

    events$.subscribe((event) => {
      if (
        event.name === signUpInTracks.signInEmailPasswordCompleted ||
        event.name === signUpInTracks.signUpFlowCompleted
      ) {
        upgradeSession();
      }
    });
  },
};

export default configuration;
