import { parse } from 'qs';

import getUserDataFromToken from 'api/authentication/getUserDataFromToken';

import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

import { trackEventByName } from 'utils/analytics';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

import tracks from '../../tracks';
import {
  GetRequirements,
  SetError,
  UpdateState,
  AuthenticationData,
  SignUpInError,
  VerificationError,
  State,
} from '../../typings';

import { Step } from './typings';
import { confirmationRequired, checkMissingData } from './utils';

export const sharedSteps = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setError: SetError,
  updateState: UpdateState,
  anySSOEnabled: boolean,
  state: State
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
      RESUME_FLOW_AFTER_SSO: async () => {
        const { requirements } = await getRequirements();
        const authenticationData = getAuthenticationData();

        const missingDataStep = checkMissingData(
          requirements,
          authenticationData,
          state.flow
        );

        if (missingDataStep) {
          setCurrentStep(missingDataStep);
          return;
        }

        if (state.flow === 'signup') {
          setCurrentStep('success');
        }

        const { successAction } = getAuthenticationData();
        if (successAction) {
          triggerSuccessAction(successAction);
        }
      },

      // When the authentication flow is triggered by an action
      // done by the user
      TRIGGER_AUTHENTICATION_FLOW: async () => {
        updateState({
          email: null,
          token: null,
          prefilledBuiltInFields: null,
          ssoProvider: null,
        });

        const { requirements, disabled_reason } = await getRequirements();
        const authenticationData = getAuthenticationData();

        const { permitted_by } = requirements.authentication;
        const isLightFlow = permitted_by === 'everyone_confirmed_email';

        // This `disabled_reason === null` is a bit of a weird check,
        // because most of the times if there is no disabled reason,
        // you would never get into the authentication flow.
        // There are however some weird exceptions related to onboarding,
        // so we need to check for this.
        const signedIn =
          disabled_reason === null || disabled_reason !== 'user_not_signed_in';

        if (isLightFlow) {
          if (!signedIn) {
            setCurrentStep('light-flow:email');
            return;
          }

          if (confirmationRequired(requirements)) {
            setCurrentStep('light-flow:email-confirmation');
            return;
          }
        }

        const isVerifiedActionFlow = permitted_by === 'verified';

        const userNotSignedIn = !signedIn;
        const userRequiresVerification = requirements.verification;

        if (
          isVerifiedActionFlow &&
          (userNotSignedIn || userRequiresVerification)
        ) {
          setCurrentStep('sso-verification:sso-providers');
          return;
        }

        if (signedIn) {
          const missingDataStep = checkMissingData(
            requirements,
            authenticationData,
            state.flow
          );

          if (missingDataStep) {
            setCurrentStep(missingDataStep);
            return;
          }
        }

        if (state.flow === 'signin') {
          anySSOEnabled
            ? setCurrentStep('sign-in:auth-providers')
            : setCurrentStep('sign-in:email-password');
          return;
        }

        if (state.flow === 'signup') {
          anySSOEnabled
            ? setCurrentStep('sign-up:auth-providers')
            : setCurrentStep('sign-up:email-password');
          return;
        }
      },

      TRIGGER_VERIFICATION_ONLY: () => {
        setCurrentStep('verification-only');
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
