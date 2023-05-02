// authentication
import createEmailOnlyAccount from 'api/authentication/sign_up/createEmailOnlyAccount';
import signIn from 'api/authentication/sign_in_out/signIn';
import signOut from 'api/authentication/sign_in_out/signOut';
import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import { handleOnSSOClick } from 'services/singleSignOn';
import checkUser from 'api/users/checkUser';

// cache
import streams from 'utils/streams';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// events
import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

// typings
import {
  GetRequirements,
  Status,
  UpdateState,
  SSOProviderWithoutVienna,
  AuthenticationData,
} from '../../typings';
import { Step } from './typings';
import { Locale } from 'typings';
import { askCustomFields, requiredCustomFields } from './utils';

export const newLightFlow = (
  authenticationData: AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  updateState: UpdateState
) => {
  const close = async () => {
    await Promise.all([streams.reset(), resetQueryCache()]);

    setStatus('ok');
    setCurrentStep('closed');

    trackEventByName(tracks.signUpFlowCompleted);

    const { successAction } = authenticationData;
    if (successAction) {
      triggerSuccessAction(successAction);
    }
  };

  return {
    // light flow
    'light-flow:email': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT_EMAIL: async (email: string, locale: Locale) => {
        setStatus('pending');
        updateState({ email });

        const response = await checkUser(email);
        const { action } = response.data.attributes;

        if (action === 'terms') {
          setCurrentStep('light-flow:email-policies');
          setStatus('ok');
        }

        if (action === 'password') {
          setCurrentStep('light-flow:password');
          setStatus('ok');
        }

        if (action === 'confirm') {
          await createEmailOnlyAccount({ email, locale });
          setCurrentStep('light-flow:email-confirmation');
          setStatus('ok');
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
      },
    },

    'light-flow:google-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        setStatus('pending');
        const { requirements } = await getRequirements();

        const verificationRequired =
          requirements.special.verification === 'require';

        handleOnSSOClick(
          'google',
          { ...authenticationData, flow: 'signin' },
          verificationRequired
        );
      },
    },

    'light-flow:facebook-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        setStatus('pending');
        const { requirements } = await getRequirements();

        const verificationRequired =
          requirements.special.verification === 'require';

        handleOnSSOClick(
          'facebook',
          { ...authenticationData, flow: 'signin' },
          verificationRequired
        );
      },
    },

    'light-flow:azure-ad-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async () => {
        setStatus('pending');
        const { requirements } = await getRequirements();

        const verificationRequired =
          requirements.special.verification === 'require';

        handleOnSSOClick(
          'azureactivedirectory',
          { ...authenticationData, flow: 'signin' },
          verificationRequired
        );
      },
    },

    'light-flow:france-connect-login': {
      CLOSE: () => setCurrentStep('closed'),
      LOGIN: async () => {
        setStatus('pending');
        const { requirements } = await getRequirements();

        const verificationRequired =
          requirements.special.verification === 'require';

        handleOnSSOClick(
          'franceconnect',
          { ...authenticationData, flow: 'signin' },
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

        await confirmEmail({ code });

        const { requirements } = await getRequirements();

        if (askCustomFields(requirements.custom_fields)) {
          setCurrentStep('sign-up:custom-fields');
          setStatus('ok');
          return;
        }

        close();
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

        await signIn({ email, password, rememberMe, tokenLifetime });

        const { requirements } = await getRequirements();

        if (requirements.special.confirmation === 'require') {
          setCurrentStep('missing-data:email-confirmation');
          setStatus('ok');
          return;
        }

        if (requiredCustomFields(requirements.custom_fields)) {
          setCurrentStep('missing-data:custom-fields');
          setStatus('ok');
          return;
        }

        close();
      },
    },
  };
};
