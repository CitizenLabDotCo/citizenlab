import createRoutes from 'routes';
import UAParser from 'ua-parser-js';

import { events$ } from 'utils/analytics';
import fetcher from 'utils/cl-react-query/fetcher';
import { getUrlLocale } from 'utils/getUrlLocale';
import matchPath, { getAllPathsFromRoutes } from 'utils/matchPath';
import { ModuleConfiguration } from 'utils/moduleUtils';

const signUpInTracks = {
  signInEmailPasswordCompleted: 'Sign in - email & password sign-in completed',
  signUpFlowCompleted: 'Sign up flow completed',
};

let allAppPaths: string[] | undefined;

const trackSessionStarted = () => {
  const uaParser = new UAParser();
  const uaResult = uaParser.getResult();

  if (allAppPaths === undefined) {
    allAppPaths = getAllPathsFromRoutes(createRoutes()[0]);
  }

  const routeMatch = matchPath(window.location.pathname, {
    paths: allAppPaths,
    exact: true,
  });

  const referrer = document.referrer ?? window.frames?.top?.document.referrer;
  const deviceModel = uaResult.device.model;
  const deviceType = uaResult.device.type ?? 'desktop';
  const browserName = uaResult.browser.name;
  const browserVersion = uaResult.browser.major;
  const osName = uaResult.os.name;
  const osVersion = uaResult.os.version;

  const entryPath = window.location.pathname;
  const entryRoute = routeMatch?.path;
  const entryLocale = getUrlLocale(window.location.pathname);

  fetcher({
    path: `/sessions`,
    action: 'post',
    body: {
      referrer,
      deviceModel,
      deviceType,
      browserName,
      browserVersion,
      osName,
      osVersion,
      entryPath,
      entryRoute,
      entryLocale,
    },
  });
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
