import { getStepConfig } from './useSteps/stepConfig';

export type Status = 'pending' | 'error' | 'ok';
export type ErrorCode =
  | 'account_creation_failed'
  | 'wrong_confirmation_code'
  | 'wrong_password';

export interface Requirements {
  authenticated: boolean;
  accountHasPassword: boolean;
  emailConfirmed: boolean;
  passwordAccepted: boolean;
}

export type GetRequirements = () => Promise<Requirements>;

export type StepConfig = ReturnType<typeof getStepConfig>;
export type Step = keyof StepConfig;
