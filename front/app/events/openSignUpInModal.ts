import { AuthenticationContext } from 'api/permissions/types';
import eventEmitter from 'utils/eventEmitter';

export type TSignUpInError = 'general' | 'franceconnect_merging_failed';

interface ISignUpInError {
  code: TSignUpInError;
}

export type TSignUpInFlow = 'signup' | 'signin';

export interface ISignUpInMetaData {
  flow: TSignUpInFlow;
  pathname: string;
  verification?: boolean;
  verificationContext?: AuthenticationContext;
  error?: ISignUpInError;
  isInvitation?: boolean;
  token?: string;
  noAutofocus?: boolean;
  onSuccess?: () => void;
}

function emitOpenSignUpInModal(metaData: ISignUpInMetaData | undefined) {
  eventEmitter.emit('openSignUpInModal', metaData);
}

export function openSignUpInModal(metaData?: Partial<ISignUpInMetaData>) {
  const emittedMetaData: ISignUpInMetaData = {
    flow: metaData?.flow || 'signup',
    pathname: metaData?.pathname || window.location.pathname,
    verification: metaData?.verification,
    verificationContext: metaData?.verificationContext,
    error: metaData?.error,
    isInvitation: !!metaData?.isInvitation,
    token: metaData?.token,
    onSuccess: metaData?.onSuccess,
  };

  emitOpenSignUpInModal(emittedMetaData);
}
