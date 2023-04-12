// authentication
import createEmailOnlyAccount from 'api/authentication/createEmailOnlyAccount';
import signIn from 'api/authentication/signIn';
import signOut from 'api/authentication/signOut';
import confirmEmail from 'api/authentication/confirmEmail';
import { handleOnSSOClick } from 'services/singleSignOn';

// events
import { triggerSuccessAction } from 'containers/NewAuthModal/SuccessActions';

// typings
import {
  GetRequirements,
  Status,
  ErrorCode,
  UpdateState,
  SSOProviderWithoutVienna,
  AuthenticationData,
} from '../../typings';
import { Step } from './typings';
import { Locale } from 'typings';

export const newLightFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  setError: (errorCode: ErrorCode) => void,
  updateState: UpdateState
) => {
  return {
    // light flow
    'light-flow:email': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT_EMAIL: (email: string) => {
        updateState({ email });
        setCurrentStep('light-flow:email-policies');
      },
      CONTINUE_WITH_SSO: (ssoProvider: SSOProviderWithoutVienna) => {
        switch (ssoProvider) {
          case 'google':
            setCurrentStep('light-flow:google-policies');
            break;
          case 'facebook':
            setCurrentStep('light-flow:facebook-policies');
            break;
          case 'azureactivedirectory':
            setCurrentStep('light-flow:azure-ad-policies');
            break;
          case 'franceconnect':
            setCurrentStep('light-flow:france-connect-login');
            break;
        }
      },
    },

    'light-flow:email-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async (email: string, locale: Locale) => {
        setStatus('pending');
        updateState({ email });

        const result = await createEmailOnlyAccount({ email, locale });

        if (result === 'account_created_successfully') {
          setStatus('ok');
          setCurrentStep('light-flow:email-confirmation');
        }

        if (result === 'email_taken') {
          setStatus('ok');
          setCurrentStep('light-flow:password');
        }

        if (result === 'error') {
          setStatus('error');
          setError('account_creation_failed');
        }
      },
    },

    'light-flow:google-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        setStatus('pending');
        const authenticationData = getAuthenticationData();
        const { requirements } = await getRequirements();
        const verificationRequired =
          requirements.special.verification === 'require';
        handleOnSSOClick('google', authenticationData, verificationRequired);
      },
    },

    'light-flow:facebook-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        setStatus('pending');
        const authenticationData = getAuthenticationData();
        const { requirements } = await getRequirements();
        const verificationRequired =
          requirements.special.verification === 'require';
        handleOnSSOClick('facebook', authenticationData, verificationRequired);
      },
    },

    'light-flow:azure-ad-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        setStatus('pending');
        const authenticationData = getAuthenticationData();
        const { requirements } = await getRequirements();
        const verificationRequired =
          requirements.special.verification === 'require';
        handleOnSSOClick(
          'azureactivedirectory',
          authenticationData,
          verificationRequired
        );
      },
    },

    'light-flow:france-connect-login': {
      CLOSE: () => setCurrentStep('closed'),
      LOGIN: async () => {
        setStatus('pending');
        const authenticationData = getAuthenticationData();
        const { requirements } = await getRequirements();
        const verificationRequired =
          requirements.special.verification === 'require';
        handleOnSSOClick(
          'franceconnect',
          authenticationData,
          verificationRequired
        );
      },
    },

    'light-flow:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setStatus('pending');

        await signOut();

        updateState({ email: null });

        setCurrentStep('light-flow:email');
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

    'light-flow:password': {
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

          const { requirements } = await getRequirements();

          if (requirements.special.confirmation === 'require') {
            setCurrentStep('light-flow:email-confirmation');
          } else {
            setCurrentStep('closed');

            const { successAction } = getAuthenticationData();
            if (successAction) {
              triggerSuccessAction(successAction);
            }
          }

          setStatus('ok');
        } catch {
          setStatus('error');
          setError('wrong_password');
        }
      },
    },
  };
};
