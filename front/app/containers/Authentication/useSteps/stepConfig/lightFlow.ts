import { SupportedLocale } from 'typings';

import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import signIn from 'api/authentication/sign_in_out/signIn';
import createEmailOnlyAccount from 'api/authentication/sign_up/createEmailOnlyAccount';
import { handleOnSSOClick } from 'api/authentication/singleSignOn';
import checkUser from 'api/users/checkUser';

import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

import { trackEventByName } from 'utils/analytics';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

import tracks from '../../tracks';
import {
  GetRequirements,
  UpdateState,
  SSOProviderWithoutVienna,
  AuthenticationData,
} from '../../typings';

import { Step } from './typings';
import {
  askCustomFields,
  requiredCustomFields,
  showOnboarding,
  doesNotMeetGroupCriteria,
  confirmationRequired,
} from './utils';

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
      SUBMIT_EMAIL: async (email: string, locale: SupportedLocale) => {
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
          case 'azureactivedirectory_b2c':
            setCurrentStep('light-flow:azure-ad-b2c-policies');
            break;
          case 'franceconnect':
            setCurrentStep('light-flow:france-connect-login');
            break;
        }
      },
    },

    'light-flow:email-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async (email: string, locale: SupportedLocale) => {
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

        handleOnSSOClick(
          'google',
          { ...getAuthenticationData(), flow: 'signin' },
          requirements.verification
        );
      },
    },

    'light-flow:facebook-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        const { requirements } = await getRequirements();

        handleOnSSOClick(
          'facebook',
          { ...getAuthenticationData(), flow: 'signin' },
          requirements.verification
        );
      },
    },

    'light-flow:azure-ad-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        const { requirements } = await getRequirements();

        handleOnSSOClick(
          'azureactivedirectory',
          { ...getAuthenticationData(), flow: 'signin' },
          requirements.verification
        );
      },
    },

    'light-flow:azure-ad-b2c-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        const { requirements } = await getRequirements();

        handleOnSSOClick(
          'azureactivedirectory_b2c',
          { ...getAuthenticationData(), flow: 'signin' },
          requirements.verification
        );
      },
    },

    'light-flow:france-connect-login': {
      CLOSE: () => setCurrentStep('closed'),
      LOGIN: async () => {
        const { requirements } = await getRequirements();

        handleOnSSOClick(
          'franceconnect',
          { ...getAuthenticationData(), flow: 'signin' },
          requirements.verification
        );
      },
    },

    'light-flow:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('light-flow:email');
      },
      SUBMIT_CODE: async (code: string) => {
        await confirmEmail({ code });

        const { requirements } = await getRequirements();

        if (askCustomFields(requirements)) {
          setCurrentStep('sign-up:custom-fields');
          return;
        }

        if (showOnboarding(requirements)) {
          setCurrentStep('sign-up:onboarding');
          return;
        }

        if (doesNotMeetGroupCriteria(requirements)) {
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

        if (confirmationRequired(requirements)) {
          setCurrentStep('missing-data:email-confirmation');
          return;
        }

        if (requiredCustomFields(requirements)) {
          setCurrentStep('missing-data:custom-fields');
          return;
        }

        if (showOnboarding(requirements)) {
          setCurrentStep('missing-data:onboarding');
          return;
        }

        invalidateQueryCache();
        setCurrentStep('closed');

        trackEventByName(tracks.signUpFlowCompleted);

        if (doesNotMeetGroupCriteria(requirements)) {
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
