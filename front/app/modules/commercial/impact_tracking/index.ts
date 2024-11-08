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

  sessionId = response.data.id;
};

const upgradeSession = () => {
  fetcher({
    path: `/sessions/current/upgrade`,
    action: 'patch',
    body: {},
  });
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    pageChanges$.subscribe((e) => {
      if (allAppPaths === undefined) {
        allAppPaths = getAllPathsFromRoutes(createRoutes()[0]);
      }

      const routeMatch = matchPath(e.path, {
        paths: allAppPaths,
        exact: true,
      });

      const route = routeMatch?.path;

      fetcher({
        path: `/sessions/${sessionId}/track_pageview`,
        action: 'post',
        body: {
          pageview: {
            path: e.path,
            route,
          },
        },
      });
    });

    trackSessionStarted();

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
