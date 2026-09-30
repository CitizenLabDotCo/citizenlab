import { phaseResponse } from 'api/authentication/authentication_requirements/__mocks__/_mockServer';
import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';

import { trackEventByName } from 'utils/analytics';

import { State } from '../../typings';

import { preAuthSteps } from './preAuthSteps';

jest.mock('utils/analytics', () => ({
  ...jest.requireActual('utils/analytics'),
  trackEventByName: jest.fn(),
}));

jest.mock(
  'api/authentication/confirm_email/confirmEmailConfirmationCode',
  () => ({ confirmCodeEmail: jest.fn(() => Promise.resolve()) })
);
jest.mock('api/authentication/sign_in_out/signIn', () =>
  jest.fn(() => Promise.resolve())
);
jest.mock('containers/Authentication/SuccessActions', () => ({
  triggerSuccessAction: jest.fn(),
}));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  checkMissingData: jest.fn(() => Promise.resolve(null)),
  doesNotMeetGroupCriteria: () => false,
}));

const getState = (flow: State['flow']): State => ({
  flow,
  email: 'resident@example.com',
  phone: null,
  new_email: null,
  new_phone: null,
  smsManualCampaignConsent: false,
  token: null,
  prefilledBuiltInFields: null,
  ssoProvider: null,
  claimTokens: null,
});

const getSteps = (flow: State['flow']) =>
  preAuthSteps(
    () => ({ context: GLOBAL_CONTEXT }),
    () => Promise.resolve(phaseResponse.data.attributes),
    jest.fn(),
    jest.fn(),
    getState(flow)
  );

describe('preAuthSteps tracking', () => {
  beforeEach(() => {
    jest.mocked(trackEventByName).mockClear();
  });

  it.each([
    ['signup', 'sign_up'],
    ['signin', 'login'],
  ] as const)(
    'tracks a confirmed email code in the %s flow as %s',
    async (flow, eventName) => {
      await getSteps(flow)['pre-auth:unauthenticated-confirmation'].SUBMIT_CODE(
        'resident@example.com',
        '1234'
      );

      expect(trackEventByName).toHaveBeenCalledWith(eventName, {
        method: 'email',
      });
    }
  );

  it('tracks a password sign-in as a login, even in the signup flow', async () => {
    // An email that turns out to be taken moves from the signup policies step
    // to the password step without resetting the flow.
    await getSteps('signup')['pre-auth:password'].SUBMIT_PASSWORD(
      'password',
      false,
      1
    );

    expect(trackEventByName).toHaveBeenCalledWith('login', {
      method: 'email',
    });
  });
});
