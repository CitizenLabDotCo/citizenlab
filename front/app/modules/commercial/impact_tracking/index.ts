import createRoutes from 'routes';

import { events$, pageChanges$ } from 'utils/analytics';
import fetcher from 'utils/cl-react-query/fetcher';
import matchPath, { getAllPathsFromRoutes } from 'utils/matchPath';
import { ModuleConfiguration } from 'utils/moduleUtils';

const signUpInTracks = {
  signInEmailPasswordCompleted: 'Sign in - email & password sign-in completed',
  signUpFlowCompleted: 'Sign up flow completed',
};

let sessionId: string;
let allAppPaths: string[] | undefined;
let firstPageViewTracked = false;

const trackSessionStarted = async () => {
  // eslint-disable-next-line
  const referrer = document.referrer ?? window.frames?.top?.document.referrer;

  const response: any = await fetcher({
    path: `/sessions`,
    action: 'post',
    body: {
      session: {
        referrer,
      },
    },
  });

  if (response.data === null) {
    throw new Error('Session creation failed!!!');
  }

  sessionId = response.data.id;

  // Because the first page view depends on the response of the session creation,
  // we handle it here and ignore the first page view event (see below).
  await trackPageView(window.location.pathname);
  firstPageViewTracked = true;
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
      if (!firstPageViewTracked) return;
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
