import { getStepConfig } from './useSteps/stepConfig';

export type Status = 'pending' | 'error' | 'ok';
export type ErrorCode =
  | 'account_creation_failed'
  | 'wrong_confirmation_code'
  | 'wrong_password';

interface Requirements {
  authenticated: boolean;
  accountHasPassword: boolean;
  emailConfirmed: boolean;
  passwordAccepted: boolean;
}

export type GetRequirements = () => Promise<Requirements>;

export type Step = keyof ReturnType<typeof getStepConfig>;
