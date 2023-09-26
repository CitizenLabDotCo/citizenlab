// authentication
import createEmailOnlyAccount from 'api/authentication/sign_up/createEmailOnlyAccount';
import signIn from 'api/authentication/sign_in_out/signIn';
import signOut from 'api/authentication/sign_in_out/signOut';
import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import { handleOnSSOClick } from 'api/authentication/singleSignOn';
import checkUser from 'api/users/checkUser';

// cache
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// events
import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

// typings
import {
  GetRequirements,
  UpdateState,
  SSOProviderWithoutVienna,
  AuthenticationData,
} from '../../typings';
import { Step } from './typings';
import { Locale } from 'typings';
import { askCustomFields, requiredCustomFields, showOnboarding } from './utils';

export const lightFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState
) => {
  return {
    // light flow
    'light-flow:email': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT_EMAIL: async (email: string, locale: Locale) => {
        updateState({ email });

        const response = await checkUser(email);
        const { action } = response.data.attributes;

        if (action === 'terms') {
          setCurrentStep('light-flow:email-policies');
        }

        if (action === 'password') {
          setCurrentStep('light-flow:password');
        }

        if (action === 'confirm') {
          await createEmailOnlyAccount({ email, locale });
          setCurrentStep('light-flow:email-confirmation');
        }
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
        updateState({ email });

        const result = await createEmailOnlyAccount({ email, locale });

        if (result === 'account_created_successfully') {
          setCurrentStep('light-flow:email-confirmation');
        }

        if (result === 'email_taken') {
          setCurrentStep('light-flow:password');
        }
      },
    },

    'light-flow:google-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        const { requirements } = await getRequirements();

        const verificationRequired =
          requirements.special.verification === 'require';

        handleOnSSOClick(
          'google',
          { ...getAuthenticationData(), flow: 'signin' },
          verificationRequired
        );
      },
    },

    'light-flow:facebook-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        const { requirements } = await getRequirements();

        const verificationRequired =
          requirements.special.verification === 'require';

        handleOnSSOClick(
          'facebook',
          { ...getAuthenticationData(), flow: 'signin' },
          verificationRequired
        );
      },
    },

    'light-flow:azure-ad-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        const { requirements } = await getRequirements();

        const verificationRequired =
          requirements.special.verification === 'require';

        handleOnSSOClick(
          'azureactivedirectory',
          { ...getAuthenticationData(), flow: 'signin' },
          verificationRequired
        );
      },
    },

    'light-flow:france-connect-login': {
      CLOSE: () => setCurrentStep('closed'),
      LOGIN: async () => {
        const { requirements } = await getRequirements();

        const verificationRequired =
          requirements.special.verification === 'require';

        handleOnSSOClick(
          'franceconnect',
          { ...getAuthenticationData(), flow: 'signin' },
          verificationRequired
        );
      },
    },

    'light-flow:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        await signOut();

        updateState({ email: null });
        setCurrentStep('light-flow:email');
      },
      SUBMIT_CODE: async (code: string) => {
        await confirmEmail({ code });

        const { requirements } = await getRequirements();

        if (askCustomFields(requirements.custom_fields)) {
          setCurrentStep('sign-up:custom-fields');
          return;
        }

        if (showOnboarding(requirements.onboarding)) {
          setCurrentStep('sign-up:onboarding');
          return;
        }

        if (requirements.special.group_membership === 'require') {
          setCurrentStep('closed');
          return;
        }

        setCurrentStep('success');
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
        await signIn({ email, password, rememberMe, tokenLifetime });

        const { requirements } = await getRequirements();

        if (requirements.special.confirmation === 'require') {
          setCurrentStep('missing-data:email-confirmation');
          return;
        }

        if (requiredCustomFields(requirements.custom_fields)) {
          setCurrentStep('missing-data:custom-fields');
          return;
        }

        if (showOnboarding(requirements.onboarding)) {
          setCurrentStep('missing-data:onboarding');
          return;
        }

        invalidateQueryCache();
        setCurrentStep('closed');

        trackEventByName(tracks.signUpFlowCompleted);

        if (requirements.special.group_membership === 'require') {
          return;
        }

        const { successAction } = getAuthenticationData();
        if (successAction) {
          triggerSuccessAction(successAction);
        }
      },
    },
  };
};
