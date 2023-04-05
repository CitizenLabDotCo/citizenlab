import { getStepConfig } from './useSteps/stepConfig';
import {
  AuthenticationRequirements,
  AuthenticationContext,
} from 'api/authentication_requirements/types';
import { SSOProvider } from 'services/singleSignOn';
import { SuccessAction } from './SuccessActions/actions';

export type Status = 'pending' | 'error' | 'ok';

export type ErrorCode =
  | 'account_creation_failed' // use existing 'something went wrong'
  | 'wrong_confirmation_code' // use existing
  | 'wrong_password' // use existing
  | 'requirements_fetching_failed' // use existing 'something went wrong'
  | 'unknown'; // use existing 'something went wrong'

export interface State {
  email: string | null;
}

export type UpdateState = (state: Partial<State>) => void;

export type GetRequirements = () => Promise<AuthenticationRequirements>;

export type StepConfig = ReturnType<typeof getStepConfig>;
export type Step = keyof StepConfig;

export interface AuthenticationData {
  flow: 'signup' | 'signin';
  pathname: string;
  context: AuthenticationContext;
  successAction?: SuccessAction;
}

export type SSOProviderWithoutVienna = Exclude<SSOProvider, 'id_vienna_saml'>;
export type AuthProvider = 'email' | SSOProvider;
