import { IInitiativeAction } from 'services/initiatives';
import { IPCAction, IParticipationContextType } from 'typings';
import eventEmitter from 'utils/eventEmitter';

export type ProjectContext = {
  id: string;
  type: IParticipationContextType;
  action: IPCAction;
};

export type InitiativeContext = {
  type: 'initiative';
  action: IInitiativeAction;
};

export type ContextShape =
  | ProjectContext
  | InitiativeContext
  | null
  | undefined;

export type TSignUpInError = 'general' | 'franceconnect_merging_failed';

interface ISignUpInError {
  code: TSignUpInError;
}

export type TSignUpInFlow = 'signup' | 'signin';

export interface ISignUpInMetaData {
  flow: TSignUpInFlow;
  pathname: string;
  verification?: boolean;
  verificationContext?: ContextShape;
  error?: ISignUpInError;
  isInvitation?: boolean;
  token?: string;
  inModal?: boolean;
  noPushLinks?: boolean;
  noAutofocus?: boolean;
  action?: () => void;
}

function emitOpenSignUpInModal(metaData: ISignUpInMetaData | undefined) {
  eventEmitter.emit('openSignUpInModal', metaData);
}

export function openSignUpInModal(metaData?: Partial<ISignUpInMetaData>) {
  console.log('calling openSignUpInModal');

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
