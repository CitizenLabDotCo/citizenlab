import createEmailOnlyAccount from 'api/authentication/createEmailOnlyAccount';
import signIn from 'api/authentication/signIn';
import signOut from 'api/authentication/signOut';
import confirmEmail from 'api/authentication/confirmEmail';

import streams from 'utils/streams';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

// typings
import { GetRequirements, Status, ErrorCode, UpdateState } from '../typings';
import { SSOProvider } from 'services/singleSignOn';
import { Locale } from 'typings';

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
  updateState: UpdateState,
  onSuccess?: () => void
) => {
  return {
    closed: {
      // When we fire this, we are already sure that we need the new flow.
      // i.e. we have already checked the requirements endpoint and stuff
      TRIGGER_REGISTRATION_FLOW: () => {
        updateState({ email: null });
        setCurrentStep('email-registration');
      },
    },

    'email-registration': {
      CLOSE: () => setCurrentStep('closed'),

      SUBMIT_EMAIL: async (email: string, locale: Locale) => {
        setStatus('pending');

        const result = await createEmailOnlyAccount({ email, locale });

        if (result === 'account_created_successfully') {
          setStatus('ok');
          setCurrentStep('email-confirmation');
        }

        if (result === 'email_taken') {
          updateState({ email });
          setStatus('ok');
          setCurrentStep('enter-password');
        }

        if (result === 'error') {
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

        await confirmEmail({ code });

        const requirements = await getRequirements();
        const emailConfirmed =
          requirements.special.confirmation === 'satisfied';

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

        try {
          await signIn({ email, password, rememberMe, tokenLifetime });

          const requirements = await getRequirements();

          if (requirements.special.confirmation === 'require') {
            setCurrentStep('email-confirmation');
          } else {
            setCurrentStep('closed');
            onSuccess && onSuccess();
          }

          setStatus('ok');
        } catch {
          setStatus('error');
          setError('wrong_password');
        }
      },
    },

    success: {
      CONTINUE: async () => {
        setStatus('pending');

        await Promise.all([streams.reset(), resetQueryCache()]);

        setStatus('ok');
        setCurrentStep('closed');

        onSuccess && onSuccess();
      },
    },
  };
};
