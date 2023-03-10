import { getStepConfig } from './useSteps/stepConfig';
import { AuthenticationRequirements } from 'api/permissions/types';

export type Status = 'pending' | 'error' | 'ok';

export type ErrorCode =
  | 'account_creation_failed'
  | 'wrong_confirmation_code'
  | 'wrong_password';

export interface State {
  email: string | null;
}

export type UpdateState = (state: Partial<State>) => void;

export type GetRequirements = () => Promise<
  AuthenticationRequirements['requirements']
>;

export type StepConfig = ReturnType<typeof getStepConfig>;
export type Step = keyof StepConfig;
