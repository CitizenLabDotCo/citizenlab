import { createAccount, confirmCode } from './mutations';
import signOut from 'api/authentication/signOut';

// typings
import { GetRequirements, Status, ErrorCode, UpdateState } from '../typings';
import { SSOProvider } from 'services/singleSignOn';

type Step =
  | 'closed'
  | 'email-registration'
  | 'email-confirmation'
  | 'enter-password'
  | 'success';

export const getStepConfig = (
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  setError: (errorCode: ErrorCode) => void,
  updateState: UpdateState
) => {
  return {
    closed: {
      // When we fire this, we are already sure that we need the new flow.
      // i.e. we have already checked the requirements endpoint and stuff
      TRIGGER_REGISTRATION_FLOW: async () => {
        updateState({ email: null });
        setCurrentStep('email-registration');
      },
    },

    'email-registration': {
      CLOSE: () => setCurrentStep('closed'),

      SUBMIT_EMAIL: async (email: string) => {
        setStatus('pending');

        await createAccount(email);
        const requirements = await getRequirements();
        const authenticated = requirements.built_in.email === 'satisfied';
        // const account;
        // const { authenticated, accountHasPassword } = await getRequirements();

        if (authenticated) {
          setStatus('ok');
          updateState({ email });

          setCurrentStep(
            accountHasPassword ? 'enter-password' : 'email-confirmation'
          );
        } else {
          setStatus('error');
          setError('account_creation_failed');
        }
      },

      CONTINUE_WITH_SSO: (_ssoProvider: SSOProvider) => {
        // TODO
        // Do what happens in normal flow when you select SSO
      },
    },

    'email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),

      CHANGE_EMAIL: async () => {
        await signOut();
        updateState({ email: null });
        setCurrentStep('email-registration');
      },

      SUBMIT_CODE: async (code: string) => {
        setStatus('pending');

        await confirmCode(code);
        const { emailConfirmed } = await getRequirements();

        if (emailConfirmed) {
          setStatus('ok');
          setCurrentStep('success');
        } else {
          setStatus('error');
          setError('wrong_confirmation_code');
        }
      },
    },

    'enter-password': {
      CLOSE: () => setCurrentStep('closed'),

      SUBMIT_PASSWORD: async (
        email: string,
        password: string,
        rememberMe: boolean,
        tokenLifetime: number
      ) => {
        setStatus('pending');

        await createAccount(email, password, rememberMe, tokenLifetime);
        const { passwordAccepted, emailConfirmed } = await getRequirements();

        if (passwordAccepted) {
          setStatus('ok');
          setCurrentStep(emailConfirmed ? 'success' : 'email-confirmation');
        } else {
          setStatus('error');
          setError('wrong_password');
        }
      },
    },

    success: {
      CONTINUE: () => setCurrentStep('closed'),
    },
  };
};
