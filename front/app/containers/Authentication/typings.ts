import { getStepConfig } from './useSteps/stepConfig';
import {
  AuthenticationRequirements,
  AuthenticationContext,
} from 'api/authentication/authentication_requirements/types';
import { SSOProvider } from 'services/singleSignOn';
import { SuccessAction } from './SuccessActions/actions';

export interface ModalProps {
  setModalOpen?: (bool: boolean) => void;
}

export type ErrorCode =
  | 'account_creation_failed'
  | 'wrong_confirmation_code'
  | 'sign_in_failed'
  | 'requirements_fetching_failed'
  | 'invitation_error'
  | 'unknown'
  | 'franceconnect_merging_failed'
  | 'email_taken_and_user_can_be_verified';

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

export type SetError = (errorCode: ErrorCode) => void;

export type SignUpInFlow = 'signup' | 'signin';
export type SignUpInError = 'general' | 'franceconnect_merging_failed';

export interface AuthenticationData {
  flow: SignUpInFlow;
  context: AuthenticationContext;
  successAction?: SuccessAction;
}

export type SSOProviderWithoutVienna = Exclude<SSOProvider, 'id_vienna_saml'>;
export type AuthProvider = 'email' | SSOProvider;
