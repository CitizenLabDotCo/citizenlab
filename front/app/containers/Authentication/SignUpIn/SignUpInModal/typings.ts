import { ContextShape } from 'events/verificationModal';

export interface ISignUpInMetaData {
  flow: TSignUpInFlow;
  pathname: string;
  verification?: boolean;
  verificationContext?: ContextShape;
  error?: ISignUpInError;
  isInvitation?: boolean;
  token?: string;
  noAutofocus?: boolean;
  action?: () => void;
}

export type TSignUpInFlow = 'signup' | 'signin';

interface ISignUpInError {
  code: TSignUpInError;
}

type TSignUpInError = 'general' | 'franceconnect_merging_failed';
