import { phaseResponse } from 'api/authentication/authentication_requirements/__mocks__/_mockServer';
import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';
import { requestCodeEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import createAccountFromInvite, {
  acceptInvite,
  Parameters as CreateAccountFromInviteParameters,
} from 'api/authentication/createAccountFromInvite';

import { reportError } from 'utils/loggingUtils';

import { inviteFlow } from './inviteFlow';

jest.mock('api/authentication/createAccountFromInvite', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve()),
  acceptInvite: jest.fn(() => Promise.resolve()),
}));
jest.mock(
  'api/authentication/confirm_email/requestEmailConfirmationCode',
  () => ({ requestCodeEmail: jest.fn(() => Promise.resolve(true)) })
);
jest.mock('utils/loggingUtils', () => ({ reportError: jest.fn() }));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  checkMissingData: jest.fn(() => Promise.resolve(null)),
  doesNotMeetGroupCriteria: () => false,
  trackAuthenticated: jest.fn(),
}));

const codeInviteParams = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  locale: 'en',
  token: 'abc123',
} satisfies CreateAccountFromInviteParameters;

const emailedInviteParams = {
  ...codeInviteParams,
  password: 'An0ther-Passw0rd!',
} satisfies CreateAccountFromInviteParameters;

const submit = async (params: CreateAccountFromInviteParameters) => {
  const setCurrentStep = jest.fn();
  const setError = jest.fn();
  const updateState = jest.fn();

  await inviteFlow(
    () => ({ context: GLOBAL_CONTEXT }),
    () => Promise.resolve(phaseResponse.data.attributes),
    setCurrentStep,
    setError,
    updateState
  )['invite:email-password'].SUBMIT(params);

  return { setCurrentStep, setError, updateState };
};

describe('inviteFlow invite:email-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('asks an invitation code user to confirm the email they typed in', async () => {
    const { setCurrentStep, setError, updateState } = await submit(
      codeInviteParams
    );

    expect(acceptInvite).toHaveBeenCalledWith(codeInviteParams);
    expect(jest.mocked(acceptInvite).mock.calls[0][0]).not.toHaveProperty(
      'password'
    );
    expect(requestCodeEmail).toHaveBeenCalledWith(codeInviteParams.email);
    expect(createAccountFromInvite).not.toHaveBeenCalled();
    expect(updateState).toHaveBeenCalledWith({
      email: codeInviteParams.email,
      flow: 'signup',
    });
    expect(setCurrentStep).toHaveBeenCalledWith(
      'pre-auth:unauthenticated-confirmation'
    );
    expect(setError).not.toHaveBeenCalled();
  });

  it('still asks for the code when the code email fails to go out', async () => {
    const error = new Error();
    jest.mocked(requestCodeEmail).mockRejectedValueOnce(error);

    const { setCurrentStep, setError } = await submit(codeInviteParams);

    expect(setCurrentStep).toHaveBeenCalledWith(
      'pre-auth:unauthenticated-confirmation'
    );
    expect(setError).toHaveBeenCalledWith('resending_code_failed');
    expect(reportError).toHaveBeenCalledWith(error);
  });

  it('signs an emailed invitee in straight away', async () => {
    const { setCurrentStep } = await submit(emailedInviteParams);

    expect(createAccountFromInvite).toHaveBeenCalledWith(emailedInviteParams);
    expect(acceptInvite).not.toHaveBeenCalled();
    expect(requestCodeEmail).not.toHaveBeenCalled();
    expect(setCurrentStep).toHaveBeenCalledWith('success');
  });
});
