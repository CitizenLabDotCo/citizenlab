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

  try {
    const data = await response.json();
    console.log('"response.json()" successful!');
    console.log(data);
    sessionId = data.data.id;
  } catch (e) {
    console.log('Error when doing "response.json()"');
  }

  console.log('RESPONSE:');
  console.log(response);

  // Because the first page view depends on the response of the session creation,
  // we handle it here and ignore the first page view event (see below).
  if (!sessionId) return;
  await trackPageView(window.location.pathname);
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
