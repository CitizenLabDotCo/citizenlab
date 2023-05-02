// utils
import { ModuleConfiguration } from 'utils/moduleUtils';
import request from 'utils/request';
import { events$ } from 'utils/analytics';

// constants
import { API_PATH } from 'containers/App/constants';

const signUpInTracks = {
  signInEmailPasswordCompleted: 'Sign in - email & password sign-in completed',
  signUpFlowCompleted: 'Sign up flow completed',
};

const trackSessionStarted = () => {
  request(`${API_PATH}/sessions`, {}, { method: 'POST' }, null);
};

const upgradeSession = () => {
  request(
    `${API_PATH}/sessions/current/upgrade`,
    {},
    { method: 'PATCH' },
    null
  );
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
