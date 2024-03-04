import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';
import { parse } from 'qs';

import { trackEventByName } from 'utils/analytics';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

import getUserDataFromToken from 'api/authentication/getUserDataFromToken';

// cache

import tracks from '../../tracks';

import {
  GetRequirements,
  SetError,
  UpdateState,
  AuthenticationData,
  SignUpInError,
  VerificationError,
} from '../../typings';

import { Step } from './typings';
import {
  requiredCustomFields,
  requiredBuiltInFields,
  askCustomFields,
  showOnboarding,
} from './utils';

export const sharedSteps = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setError: SetError,
  updateState: UpdateState,
  anySSOEnabled: boolean
) => {
  return {
    closed: {
      // When the user entered the platform through an invite link
      START_INVITE_FLOW: async (search: string) => {
        const params = parse(search, { ignoreQueryPrefix: true });
        const token = params.token;

        if (typeof token === 'string') {
          try {
            const response = await getUserDataFromToken(token);

            const prefilledBuiltInFields = {
              first_name: response.data.attributes.first_name ?? undefined,
              last_name: response.data.attributes.last_name ?? undefined,
              email: response.data.attributes.email ?? undefined,
            };

            updateState({ token, prefilledBuiltInFields });
            setCurrentStep('sign-up:email-password');
          } catch {
            setCurrentStep('sign-up:email-password');
            setError('invitation_error');
          }
        } else {
          setCurrentStep('sign-up:invite');
        }
      },

      // When the user returns from SSO
      RESUME_FLOW_AFTER_SSO: async (enterClaveUnicaEmail: boolean) => {
        if (enterClaveUnicaEmail) {
          setCurrentStep('clave-unica:email');
          return;
        }

        const { flow } = getAuthenticationData();
        const { requirements } = await getRequirements();

        if (flow === 'signup') {
          if (requirements.special.verification === 'require') {
            setCurrentStep('sign-up:verification');
            return;
          }

          if (askCustomFields(requirements.custom_fields)) {
            setCurrentStep('sign-up:custom-fields');
            return;
          }

          if (showOnboarding(requirements.onboarding)) {
            setCurrentStep('sign-up:onboarding');
            return;
          }

          setCurrentStep('success');
        }

        if (flow === 'signin') {
          if (requirements.special.verification === 'require') {
            setCurrentStep('missing-data:verification');
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

          const { successAction } = getAuthenticationData();
          if (successAction) {
            triggerSuccessAction(successAction);
          }
        }
      },

      // When the authentication flow is triggered by an action
      // done by the user
      TRIGGER_AUTHENTICATION_FLOW: async () => {
        updateState({
          email: null,
          token: null,
          prefilledBuiltInFields: null,
        });

        const { requirements } = await getRequirements();

        const isLightFlow = requirements.special.password === 'dont_ask';
        const signedIn = requirements.built_in.email === 'satisfied';

        if (isLightFlow) {
          if (!signedIn) {
            setCurrentStep('light-flow:email');
            return;
          }

          if (requirements.special.confirmation === 'require') {
            setCurrentStep('light-flow:email-confirmation');
            return;
          }
        }

        if (signedIn) {
          if (requirements.special.confirmation === 'require') {
            setCurrentStep('missing-data:email-confirmation');
            return;
          }

          if (requiredBuiltInFields(requirements)) {
            setCurrentStep('missing-data:built-in');
            return;
          }

          if (requirements.special.verification === 'require') {
            setCurrentStep('missing-data:verification');
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

          return;
        }

        const { flow } = getAuthenticationData();

        if (flow === 'signin') {
          anySSOEnabled
            ? setCurrentStep('sign-in:auth-providers')
            : setCurrentStep('sign-in:email-password');
          return;
        }

        if (flow === 'signup') {
          anySSOEnabled
            ? setCurrentStep('sign-up:auth-providers')
            : setCurrentStep('sign-up:email-password');
          return;
        }
      },

      TRIGGER_VERIFICATION_ONLY: () => {
        setCurrentStep('verification-only');
      },

      REOPEN_CLAVE_UNICA: () => {
        setCurrentStep('clave-unica:email');
      },

      TRIGGER_VERIFICATION_ERROR: (error_code?: VerificationError) => {
        if (error_code === 'not_entitled_under_minimum_age') {
          setCurrentStep('missing-data:verification');
          setError('not_entitled_under_minimum_age');
        } else {
          setCurrentStep('sign-up:auth-providers');
          setError('unknown');
        }
      },

      TRIGGER_AUTH_ERROR: (error_code?: SignUpInError) => {
        if (error_code === 'franceconnect_merging_failed') {
          setCurrentStep('sign-up:auth-providers');
          setError('franceconnect_merging_failed');
        } else {
          setCurrentStep('sign-up:auth-providers');
          setError('unknown');
        }
      },
    },

    success: {
      CONTINUE: async () => {
        invalidateQueryCache();
        setCurrentStep('closed');

        trackEventByName(tracks.signUpFlowCompleted);
        const { successAction } = getAuthenticationData();

        if (successAction) {
          triggerSuccessAction(successAction);
        }
      },
    },
  };
};
