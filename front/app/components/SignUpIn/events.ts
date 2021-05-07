import eventEmitter from 'utils/eventEmitter';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { TSignUpSteps } from 'components/SignUpIn/SignUp';

enum events {
  openSignUpInModal = 'openSignUpInModal',
  closeSignUpInModal = 'closeSignUpInModal',
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
    requiresConfirmation: !!metaData?.requiresConfirmation,
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

export function modifyMetaData(
  oldMetaData: ISignUpInMetaData | undefined,
  newMetaData: Partial<ISignUpInMetaData>
) {
  const overridenMetaData = oldMetaData
    ? { ...oldMetaData, ...newMetaData }
    : newMetaData;

  if (overridenMetaData === oldMetaData) {
    return;
  }

  const emittedMetaData: ISignUpInMetaData = {
    flow: 'signup',
    pathname: window.location.pathname,
    verification: undefined,
    verificationContext: undefined,
    error: false,
    isInvitation: false,
    token: undefined,
    inModal: undefined,
    action: undefined,
    ...overridenMetaData,
  };

  eventEmitter.emit<ISignUpInMetaData>(events.changeMetaData, emittedMetaData);
}

export function resetMetaData() {
  eventEmitter.emit<ISignUpInMetaData>(events.changeMetaData, undefined);
}

export const openSignUpInModal$ = eventEmitter.observeEvent<ISignUpInMetaData>(
  events.openSignUpInModal
);

export const changeMetaData$ = eventEmitter.observeEvent<ISignUpInMetaData>(
  events.changeMetaData
);

// ---------

export function closeSignUpInModal() {
  eventEmitter.emit(events.closeSignUpInModal);
}

export const closeSignUpInModal$ = eventEmitter.observeEvent(
  events.closeSignUpInModal
);

// ---------

export function signUpActiveStepChange(
  newActiveStep: TSignUpSteps | null | undefined
) {
  eventEmitter.emit<TSignUpSteps | null | undefined>(
    events.signUpActiveStepChange,
    newActiveStep
  );
}

export const signUpActiveStepChange$ = eventEmitter.observeEvent<
  TSignUpSteps | null | undefined
>(events.signUpActiveStepChange);

// ---------
