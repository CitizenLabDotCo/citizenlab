interface Requirements {
  accountWithEmailCreated: boolean;
  emailConfirmationRequired: boolean;
}

// export type GetRequirements = () => Promise<Requirements>;
export type GetRequirements = (r?: Requirements) => Promise<Requirements>;

export type Status = 'pending' | 'error' | 'ok';
export type Error = 'account_creation_failed' | 'email_confirmation_failed';

export interface State {
  status: Status;
  error?: Error;
}

type SetState = (newState: Partial<State>) => void;

const _fakeSignUpRequirements: Requirements = {
  accountWithEmailCreated: false,
  emailConfirmationRequired: true,
};

const _fakeConfirmationRequirements: Requirements = {
  accountWithEmailCreated: true,
  emailConfirmationRequired: false,
};

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
        await getRequirements(_fakeSignUpRequirements);

      if (accountWithEmailCreated) {
        setState({ status: 'ok' });

        return emailConfirmationRequired ? 'email-confirmation' : 'success';
      }

      setState({
        status: 'error',
        error: 'account_creation_failed',
      });

      return null;
    },
  },
  'email-confirmation': {
    CONFIRM_EMAIL: async (
      getRequirements: GetRequirements,
      setState: SetState
    ) => {
      setState({ status: 'pending' });
      const { emailConfirmationRequired } = await getRequirements(
        _fakeConfirmationRequirements
      );

      if (!emailConfirmationRequired) {
        setState({ status: 'ok' });
        return 'success';
      }

      setState({
        status: 'error',
        error: 'email_confirmation_failed',
      });

      return null;
    },
  },
  success: {
    EXIT: () => 'inactive',
  },
};

export type Steps = typeof STEPS;
export type Step = keyof Steps;

const getStepTransition = <S extends Step, E extends keyof Steps[S]>(
  currentStep: S,
  event: E
): Steps[S][E] => {
  return STEPS[currentStep][event];
};

export const getNextStep = async <S extends Step, E extends keyof Steps[S]>(
  currentStep: S,
  event: E,
  getRequirements: GetRequirements,
  setState: SetState
): Promise<Step | null> => {
  const stepTransition = getStepTransition(currentStep, event);
  // @ts-ignore
  return await stepTransition(getRequirements, setState);
};
