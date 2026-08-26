import { SupportedLocale } from 'typings';

import { confirmCodeEmail } from 'api/authentication/confirm_email/confirmEmailConfirmationCode';
import { requestCodeEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import { confirmCodePhone } from 'api/authentication/confirm_phone/confirmPhoneConfirmationCode';
import { requestCodePhone } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import signIn from 'api/authentication/sign_in_out/signIn';
import createEmailOnlyAccount from 'api/authentication/sign_up/createEmailOnlyAccount';
import createPhoneOnlyAccount from 'api/authentication/sign_up/createPhoneOnlyAccount';
import { redirectToSSOProvider } from 'api/authentication/singleSignOn';

import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

import {
  GetRequirements,
  UpdateState,
  SSOProviderWithoutVienna,
  AuthenticationData,
  State,
} from '../../typings';

import { Step } from './typings';
import {
  doesNotMeetGroupCriteria,
  checkMissingData,
  handleSubmitEmail,
  handleSubmitPhone,
  handleSSOClick,
} from './utils';

export const preAuthSteps = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState,
  state: State
) => {
  // Shared by every step that ends with an authenticated user: the step the user
  // still has to go through before they can participate, or null when there is
  // nothing left and the caller can end the flow.
  const getRemainingRequirementStep = async (): Promise<Step | null> => {
    const { requirements } = await getRequirements();

    const missingDataStep = await checkMissingData(
      requirements,
      getAuthenticationData(),
      state.flow
    );

    if (missingDataStep) return missingDataStep;
    if (doesNotMeetGroupCriteria(requirements)) return 'access-denied';

    return null;
  };

  return {
    'pre-auth:start': {
      CLOSE: () => setCurrentStep('closed'),

      SUBMIT_EMAIL: async (email: string) => {
        updateState({ email, phone: null });
        await handleSubmitEmail(email, setCurrentStep, updateState);
      },

      SUBMIT_PHONE: async (phone: string) => {
        updateState({ phone, email: null });
        await handleSubmitPhone(phone, setCurrentStep, updateState);
      },

      CONTINUE_WITH_SSO: async (ssoProvider: SSOProviderWithoutVienna) => {
        handleSSOClick(
          ssoProvider,
          getAuthenticationData,
          getRequirements,
          setCurrentStep,
          updateState,
          state
        );
      },
    },

    'pre-auth:policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async (
        email: string,
        locale: SupportedLocale,
        claimTokens?: string[]
      ) => {
        const result = await createEmailOnlyAccount({
          email,
          locale,
          claimTokens,
        });

        if (result === 'account_created_successfully') {
          setCurrentStep('pre-auth:unauthenticated-confirmation');
        }

        if (result === 'email_taken') {
          setCurrentStep('pre-auth:password');
        }
      },
      GO_BACK: () => setCurrentStep('pre-auth:start'),
    },

    'pre-auth:phone-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async (
        phone: string,
        locale: SupportedLocale,
        claimTokens?: string[]
      ) => {
        await createPhoneOnlyAccount({ phone, locale, claimTokens });
        setCurrentStep('pre-auth:unauthenticated-phone-confirmation');
      },
      GO_BACK: () => setCurrentStep('pre-auth:start'),
    },

    // Shared by the email and the phone flow: which identifier the password
    // belongs to is read from the state.
    'pre-auth:password': {
      CLOSE: () => setCurrentStep('closed'),
      GO_BACK: () => setCurrentStep('pre-auth:start'),
      SUBMIT_PASSWORD: async (
        password: string,
        rememberMe: boolean,
        tokenLifetime: number,
        claimTokens?: string[]
      ) => {
        const { email, phone } = state;

        await signIn({
          ...(phone ? { phone } : { email: email as string }),
          password,
          rememberMe,
          tokenLifetime,
          claimTokens,
        });

        const remainingStep = await getRemainingRequirementStep();

        if (remainingStep) {
          setCurrentStep(remainingStep);
          return;
        }

        setCurrentStep('closed');

        const { successAction } = getAuthenticationData();
        if (successAction) {
          triggerSuccessAction(successAction);
        }
      },
    },

    'pre-auth:sso-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: (ssoProvider: SSOProviderWithoutVienna) => {
        redirectToSSOProvider(
          ssoProvider,
          getAuthenticationData(),
          true,
          state.flow,
          state.claimTokens ?? undefined
        );
      },
    },

    'pre-auth:unauthenticated-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('pre-auth:start');
      },
      SUBMIT_CODE: async (email: string, code: string) => {
        await confirmCodeEmail(email, code);

        setCurrentStep((await getRemainingRequirementStep()) ?? 'success');
      },
      RESEND_CODE: async (email: string) => {
        await requestCodeEmail(email);
      },
    },

    'pre-auth:unauthenticated-phone-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_PHONE: async () => {
        setCurrentStep('pre-auth:start');
      },
      SUBMIT_CODE: async (code: string) => {
        await confirmCodePhone(code, state.phone ?? '');

        setCurrentStep((await getRemainingRequirementStep()) ?? 'success');
      },
      RESEND_CODE: async (phone: string) => {
        await requestCodePhone(phone);
      },
    },
  };
};
