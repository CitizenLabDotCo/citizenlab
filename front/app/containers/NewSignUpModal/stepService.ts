interface Requirements {
  accountWithEmailCreated: boolean;
  emailConfirmationRequired: boolean;
}

type GetRequirements = () => Promise<Requirements>;

type Status = 'pending' | 'error' | 'ok';
type Error = 'account_creation_failed' | 'email_confirmation_failed';

export interface State {
  status: Status;
  error?: Error;
}

type SetState = (newState: Partial<State>) => void;

const STEPS = {
  inactive: {
    START_SIGN_IN_FLOW: () => 'sign-in-auth-providers',
    START_SIGN_UP_FLOW: () => 'sign-up-auth-providers',
  },
  'sign-in-auth-providers': {
    TOGGLE_FLOW: () => 'sign-up-auth-providers',
  },
  'sign-up-auth-providers': {
    TOGGLE_FLOW: () => 'sign-in-auth-providers',
    ENTER_EMAIL_SIGN_UP: () => 'email-sign-up',
  },
  'email-sign-up': {
    GO_BACK: () => 'sign-up-auth-providers',
    SUBMIT_EMAIL: async (
      getRequirements: GetRequirements,
      setState: SetState
    ) => {
      setState({ status: 'pending' });
      const { accountWithEmailCreated, emailConfirmationRequired } =
        await getRequirements();

      if (accountWithEmailCreated) {
        setState({ status: 'ok' });

        return emailConfirmationRequired ? 'email-confirmation' : 'success';
      }

      setState({
        status: 'error',
        error: 'account_creation_failed',
      });

      return 'email-sign-up';
    },
  },
  'email-confirmation': {
    CONFIRM_EMAIL: async (
      getRequirements: GetRequirements,
      setState: SetState
    ) => {
      setState({ status: 'pending' });
      const { emailConfirmationRequired } = await getRequirements();

      if (!emailConfirmationRequired) {
        setState({ status: 'ok' });
        return 'success';
      }

      setState({
        status: 'error',
        error: 'email_confirmation_failed',
      });

      return 'email-confirmation';
    },
  },
  success: {
    EXIT: () => 'inactive',
  },
};

type Steps = typeof STEPS;
export type Step = keyof Steps;

export const getNextStep = async <S extends Step, E extends keyof Steps[S]>(
  currentStep: S,
  event: E,
  getRequirements: GetRequirements,
  setState: SetState
) => {
  // @ts-ignore
  return await STEPS[currentStep][event](getRequirements, setState);
};
