import { getStepConfig } from './useSteps/stepConfig';
import {
  AuthenticationRequirements,
  AuthenticationContext,
} from 'api/authentication/authentication_requirements/types';
import { SSOProvider } from 'services/singleSignOn';
import { SuccessAction } from './SuccessActions/actions';

export type Status = 'pending' | 'ok';

export type ErrorCode =
  | 'account_creation_failed'
  | 'wrong_confirmation_code'
  | 'wrong_password'
  | 'requirements_fetching_failed'
  | 'invitation_error'
  | 'unknown';

export interface State {
  email: string | null;
  token: string | null;
  prefilledBuiltInFields: {
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
}

export type UpdateState = (state: Partial<State>) => void;

export type GetRequirements = () => Promise<AuthenticationRequirements>;

export type StepConfig = ReturnType<typeof getStepConfig>;
export type Step = keyof StepConfig;

export type SignUpInFlow = 'signup' | 'signin';
export type SignUpInError = 'general' | 'franceconnect_merging_failed';

export interface AuthenticationData {
  flow: SignUpInFlow;
  context: AuthenticationContext;
  successAction?: SuccessAction;

  // TODO clean this up
  error?: { code: SignUpInError };
}

export type SSOProviderWithoutVienna = Exclude<SSOProvider, 'id_vienna_saml'>;
export type AuthProvider = 'email' | SSOProvider;
