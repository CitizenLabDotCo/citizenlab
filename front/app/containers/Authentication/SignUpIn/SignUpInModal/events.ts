import eventEmitter from 'utils/eventEmitter';
import { ISignUpInMetaData } from './SignUpIn';
import { TSignUpStep } from './SignUp';

enum events {
  openSignUpInModal = 'openSignUpInModal',
  signUpActiveStepChange = 'signUpActiveStepChange',
}

// ---------
function emitOpenSignUpInModal(metaData: ISignUpInMetaData | undefined) {
  eventEmitter.emit(events.openSignUpInModal, metaData);
}

export const openSignUpInModal$ = eventEmitter.observeEvent<
  ISignUpInMetaData | undefined
>(events.openSignUpInModal);

export function closeSignUpInModal() {
  emitOpenSignUpInModal(undefined);
}

// ---------

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

// ---------
