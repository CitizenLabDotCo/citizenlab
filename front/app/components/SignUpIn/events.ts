import eventEmitter from 'utils/eventEmitter';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { TSignUpStep } from 'components/SignUpIn/SignUp';

enum events {
  openSignUpInModal = 'openSignUpInModal',
  signUpActiveStepChange = 'signUpActiveStepChange',
  changeMetaData = 'metaDataChange',
}

// ---------

export function openSignUpInModal(metaData?: Partial<ISignUpInMetaData>) {
  const emittedMetaData: ISignUpInMetaData = {
    flow: metaData?.flow || 'signup',
    pathname: metaData?.pathname || window.location.pathname,
    verification: metaData?.verification,
    verificationContext: metaData?.verificationContext,
    error: !!metaData?.error,
    isInvitation: !!metaData?.isInvitation,
    token: metaData?.token,
    inModal: true,
    action: metaData?.action || undefined,
  };

  eventEmitter.emit<ISignUpInMetaData>(
    events.openSignUpInModal,
    emittedMetaData
  );
}

export const openSignUpInModal$ = eventEmitter.observeEvent<ISignUpInMetaData>(
  events.openSignUpInModal
);

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
