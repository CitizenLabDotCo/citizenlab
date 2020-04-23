import eventEmitter from 'utils/eventEmitter';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { TSignUpSteps } from 'components/SignUpIn/SignUp';

enum events {
  openSignUpInModal = 'openSignUpInModal',
  closeSignUpInModal = 'closeSignUpInModal',
  signUpActiveStepChange = 'signUpActiveStepChange'
}

// ---------

export function openSignUpInModal(metaData?: Partial<ISignUpInMetaData>) {
  eventEmitter.emit<ISignUpInMetaData>(events.openSignUpInModal, {
    flow: metaData?.flow || 'signup',
    pathname: metaData?.pathname || window.location.pathname,
    verification: metaData?.verification ?? false,
    action: metaData?.action || undefined
  });
}

export const openSignUpInModal$ = eventEmitter.observeEvent<ISignUpInMetaData>(events.openSignUpInModal);

// ---------

export function closeSignUpInModal() {
  eventEmitter.emit(events.closeSignUpInModal);
}

export const closeSignUpInModal$ = eventEmitter.observeEvent(events.closeSignUpInModal);

// ---------

export function signUpActiveStepChange(newActiveStep: TSignUpSteps | null | undefined) {
  eventEmitter.emit<TSignUpSteps | null | undefined>(events.signUpActiveStepChange, newActiveStep);
}

export const signUpActiveStepChange$ = eventEmitter.observeEvent<TSignUpSteps | null | undefined>(events.signUpActiveStepChange);

// ---------
