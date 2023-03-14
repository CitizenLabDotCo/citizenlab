import eventEmitter from 'utils/eventEmitter';
import { TSignUpStep } from './SignUp';

enum events {
  signUpActiveStepChange = 'signUpActiveStepChange',
}

export function signUpActiveStepChange(
  newActiveStep: TSignUpStep | null | undefined
) {
  eventEmitter.emit<TSignUpStep | null | undefined>(
    events.signUpActiveStepChange,
    newActiveStep
  );
}

export const signUpActiveStepChange$ = eventEmitter.observeEvent<
  TSignUpStep | null | undefined
>(events.signUpActiveStepChange);
