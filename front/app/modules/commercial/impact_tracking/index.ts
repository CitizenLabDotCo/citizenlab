import UAParser from 'ua-parser-js';

import { events$ } from 'utils/analytics';
import fetcher from 'utils/cl-react-query/fetcher';
import { ModuleConfiguration } from 'utils/moduleUtils';

const signUpInTracks = {
  signInEmailPasswordCompleted: 'Sign in - email & password sign-in completed',
  signUpFlowCompleted: 'Sign up flow completed',
};

const trackSessionStarted = () => {
  const uaParser = new UAParser();
  const uaResult = uaParser.getResult();

  const referrer = document.referrer ?? window.frames?.top?.document.referrer;
  const deviceType = uaResult.device.type ?? 'desktop';
  const browserName = uaResult.browser.name;
  const browserVersion = uaResult.browser.major;
  const osName = uaResult.os.name;
  const osVersion = uaResult.os.version;

  fetcher({
    path: `/sessions`,
    action: 'post',
    body: {
      referrer,
      deviceType,
      browserName,
      browserVersion,
      osName,
      osVersion,
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
