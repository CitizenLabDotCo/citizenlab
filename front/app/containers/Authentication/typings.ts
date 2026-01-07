import {
  AuthenticationRequirements,
  AuthenticationContext,
} from 'api/authentication/authentication_requirements/types';
import { SSOProvider } from 'api/authentication/singleSignOn';

import { SuccessAction } from './SuccessActions/actions';
import { getStepConfig } from './useSteps/stepConfig';

export type ErrorCode =
  | 'account_creation_failed'
  | 'wrong_confirmation_code'
  | 'sign_in_failed'
  | 'requirements_fetching_failed'
  | 'invitation_error'
  | 'unknown'
  | 'franceconnect_merging_failed'
  | 'email_taken_and_user_can_be_verified'
  | 'verification_under_minimum_age'
  | 'verification_lives_outside'
  | 'verification_no_match'
  | 'verification_service_error'
  | 'auth_under_minimum_age'
  | 'auth_lives_outside'
  | 'auth_no_match'
  | 'auth_service_error'
  | 'verification_taken'
  | 'resending_code_failed';

export interface State {
  flow: 'signup' | 'signin';
  email: string | null;
  token: string | null;
  prefilledBuiltInFields: {
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
  ssoProvider: SSOProvider | null;
}

export type UpdateState = (state: Partial<State>) => void;

export type GetRequirements = () => Promise<AuthenticationRequirements>;

export type StepConfig = ReturnType<typeof getStepConfig>;
export type Step = keyof StepConfig;

export type SetError = (errorCode: ErrorCode) => void;

type NotEntitledError =
  | 'not_entitled_under_minimum_age'
  | 'not_entitled_lives_outside'
  | 'not_entitled_no_match'
  | 'not_entitled_service_error';
export type SignUpInError =
  | NotEntitledError
  | 'general'
  | 'franceconnect_merging_failed';
export type VerificationError = NotEntitledError | 'taken';

export interface AuthenticationData {
  context: AuthenticationContext;
  successAction?: SuccessAction;
}

export type SSOProviderWithoutVienna = Exclude<SSOProvider, 'id_vienna_saml'>;
export type AuthProvider = 'email' | SSOProvider;
