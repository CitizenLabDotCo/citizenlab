import { ISignUpInMetaData } from 'components/SignUpIn';
import { TSignUpStep } from 'components/SignUpIn/SignUp';
import eventEmitter from 'utils/eventEmitter';

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

export function openSignUpInModal(metaData?: Partial<ISignUpInMetaData>) {
  const emittedMetaData: ISignUpInMetaData = {
    flow: metaData?.flow || 'signup',
    pathname: metaData?.pathname || window.location.pathname,
    verification: metaData?.verification,
    verificationContext: metaData?.verificationContext,
    error: metaData?.error,
    isInvitation: !!metaData?.isInvitation,
    token: metaData?.token,
    inModal: true,
    action: metaData?.action || undefined,
  };

  emitOpenSignUpInModal(emittedMetaData);
}

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
