import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';

import { sharedSteps } from './sharedSteps';

jest.mock('containers/Authentication/SuccessActions', () => ({
  triggerSuccessAction: jest.fn(),
}));

const setup = () => {
  const setCurrentStep = jest.fn();
  const setError = jest.fn();
  const steps = sharedSteps(
    () => ({ context: GLOBAL_CONTEXT }),
    jest.fn(),
    setCurrentStep,
    setError,
    jest.fn()
  );

  return { steps, setCurrentStep, setError };
};

describe('TRIGGER_VERIFICATION_ERROR', () => {
  // E.g. the session expired while the page was open: verifying again won't
  // work until the user signs in.
  it('asks the user to sign in when they were no longer signed in', () => {
    const { steps, setCurrentStep, setError } = setup();

    steps.closed.TRIGGER_VERIFICATION_ERROR('no_token_passed');

    expect(setCurrentStep).toHaveBeenCalledWith('pre-auth:start');
    expect(setError).toHaveBeenCalledWith('verification_signed_out');
  });

  it('shows the verification step again for other verification errors', () => {
    const { steps, setCurrentStep, setError } = setup();

    steps.closed.TRIGGER_VERIFICATION_ERROR('taken');

    expect(setCurrentStep).toHaveBeenCalledWith('missing-data:verification');
    expect(setError).toHaveBeenCalledWith('verification_taken');
  });
});
