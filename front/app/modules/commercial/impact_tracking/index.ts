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
  const device_type = uaResult.device.type ?? 'desktop';
  const browser_name = uaResult.browser.name;
  const browser_version = uaResult.browser.major;
  const os_name = uaResult.os.name;
  const os_version = uaResult.os.version;
  const entry_path = window.location.pathname;

  const response: any = await fetcher({
    path: `/sessions`,
    action: 'post',
    body: {
      session: {
        referrer,
        device_type,
        browser_name,
        browser_version,
        os_name,
        os_version,
        entry_path,
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
