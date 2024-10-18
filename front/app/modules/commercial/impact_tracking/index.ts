import UAParser from 'ua-parser-js';

import { events$, pageChanges$ } from 'utils/analytics';
import fetcher from 'utils/cl-react-query/fetcher';
import { ModuleConfiguration } from 'utils/moduleUtils';

const signUpInTracks = {
  signInEmailPasswordCompleted: 'Sign in - email & password sign-in completed',
  signUpFlowCompleted: 'Sign up flow completed',
};

let sessionId: string;

const trackSessionStarted = async () => {
  const uaParser = new UAParser();
  const uaResult = uaParser.getResult();

  const referrer = document.referrer ?? window.frames?.top?.document.referrer;
  const deviceType = uaResult.device.type ?? 'desktop';
  const browserName = uaResult.browser.name;
  const browserVersion = uaResult.browser.major;
  const osName = uaResult.os.name;
  const osVersion = uaResult.os.version;
  const entryPath = window.location.pathname;

  const response: any = await fetcher({
    path: `/sessions`,
    action: 'post',
    body: {
      referrer,
      deviceType,
      browserName,
      browserVersion,
      osName,
      osVersion,
      entryPath,
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

let entryPointIgnored = false;

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    pageChanges$.subscribe((e) => {
      // Ignore the first page change event,
      // this is already handled by the session tracking start
      if (!entryPointIgnored) {
        entryPointIgnored = true;
        return;
      }

      fetcher({
        path: `/sessions/${sessionId}/track_pageview`,
        action: 'post',
        body: {
          path: e.path,
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
