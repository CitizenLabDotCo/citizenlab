import { getStepConfig } from './useSteps/stepConfig';
import {
  AuthenticationRequirements,
  AuthenticationContext,
} from 'api/authentication_requirements/types';
import { SSOProvider } from 'services/singleSignOn';
import { SuccessAction } from './SuccessActions/actions';

export type Status = 'pending' | 'error' | 'ok';

export type ErrorCode =
  | 'account_creation_failed'
  | 'wrong_confirmation_code'
  | 'wrong_password'
  | 'requirements_fetching_failed'
  | 'unknown';

export interface State {
  email: string | null;
}

export type UpdateState = (state: Partial<State>) => void;

export type GetRequirements = () => Promise<AuthenticationRequirements>;

export type StepConfig = ReturnType<typeof getStepConfig>;
export type Step = keyof StepConfig;

export type SignUpInFlow = 'signup' | 'signin';
export type SignUpInError = 'general' | 'franceconnect_merging_failed';

export interface AuthenticationData {
  flow: SignUpInFlow;
  pathname: string;
  context: AuthenticationContext;
  successAction?: SuccessAction;

  // TODO clean this up
  error?: { code: SignUpInError };
  isInvitation?: boolean;
  token?: string;
  verification?: boolean;
}

export type SSOProviderWithoutVienna = Exclude<SSOProvider, 'id_vienna_saml'>;
export type AuthProvider = 'email' | SSOProvider;
