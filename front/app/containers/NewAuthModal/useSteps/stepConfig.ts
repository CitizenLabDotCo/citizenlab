// authentication
import createEmailOnlyAccount from 'api/authentication/createEmailOnlyAccount';
import signIn from 'api/authentication/signIn';
import signOut from 'api/authentication/signOut';
import confirmEmail from 'api/authentication/confirmEmail';
import { handleOnSSOClick } from 'services/singleSignOn';

// cache
import streams from 'utils/streams';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

// typings
import {
  GetRequirements,
  Status,
  ErrorCode,
  UpdateState,
  SSOProviderWithoutVienna,
  AuthenticationData,
} from '../typings';
import { Locale } from 'typings';

type Step =
  | 'closed'
  | 'email-registration'
  | 'email-policies'
  | 'google-policies'
  | 'facebook-policies'
  | 'azure-ad-policies'
  | 'france-connect-login'
  | 'email-confirmation'
  | 'enter-password'
  | 'success';

export const getStepConfig = (
  getAuthenticationData: () => AuthenticationData,
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

        const requirements = await getRequirements();

        if (requirements.built_in.email === 'satisfied') {
          setCurrentStep('email-confirmation');
        } else {
          setCurrentStep('email-registration');
        }
      },
    },

    'email-registration': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT_EMAIL: (email: string) => {
        updateState({ email });
        setCurrentStep('email-policies');
      },
      CONTINUE_WITH_SSO: (ssoProvider: SSOProviderWithoutVienna) => {
        switch (ssoProvider) {
          case 'google':
            setCurrentStep('google-policies');
            break;
          case 'facebook':
            setCurrentStep('facebook-policies');
            break;
          case 'azureactivedirectory':
            setCurrentStep('azure-ad-policies');
            break;
          case 'franceconnect':
            setCurrentStep('france-connect-login');
            break;
          default:
            break;
        }
      },
    },

    'email-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async (email: string, locale: Locale) => {
        setStatus('pending');
        updateState({ email });

        const result = await createEmailOnlyAccount({ email, locale });

        if (result === 'account_created_successfully') {
          setStatus('ok');
          setCurrentStep('email-confirmation');
        }

        if (result === 'email_taken') {
          setStatus('ok');
          setCurrentStep('enter-password');
        }

        if (result === 'error') {
          setStatus('error');
          setError('account_creation_failed');
        }
      },
    },

    'google-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: () => {
        const authenticationData = getAuthenticationData();
        handleOnSSOClick('google', authenticationData);
      },
    },

    'facebook-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: () => {
        const authenticationData = getAuthenticationData();
        handleOnSSOClick('facebook', authenticationData);
      },
    },

    'azure-ad-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: () => {
        const authenticationData = getAuthenticationData();
        handleOnSSOClick('azureactivedirectory', authenticationData);
      },
    },

    'france-connect-login': {
      CLOSE: () => setCurrentStep('closed'),
      LOGIN: () => {
        const authenticationData = getAuthenticationData();
        handleOnSSOClick('franceconnect', authenticationData);
      },
    },

    'email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setStatus('pending');

        await signOut();

        updateState({ email: null });

        setCurrentStep('email-registration');
        setStatus('ok');
      },
      SUBMIT_CODE: async (code: string) => {
        setStatus('pending');

        try {
          await confirmEmail({ code });
          setStatus('ok');
          setCurrentStep('success');
        } catch (e) {
          setStatus('error');

          if (e?.code?.[0]?.error === 'invalid') {
            setError('wrong_confirmation_code');
          } else {
            setError('unknown');
          }
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

            const { onSuccess } = getAuthenticationData();
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

        const { onSuccess } = getAuthenticationData();
        onSuccess && onSuccess();
      },
    },
  };
};
