import { parse } from 'qs';

import getUserDataFromToken from 'api/authentication/getUserDataFromToken';

import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

import { trackEventByName } from 'utils/analytics';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import { clearClaimTokens } from 'utils/claimToken';

import tracks from '../../tracks';
import {
  GetRequirements,
  SetError,
  UpdateState,
  AuthenticationData,
  SignUpInError,
  VerificationError,
  ErrorCode,
} from '../../typings';

import { Step } from './typings';
import { checkMissingData } from './utils';

export const sharedSteps = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setError: SetError,
  updateState: UpdateState
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
            setCurrentStep('invite:email-password');
          } catch {
            setCurrentStep('invite:email-password');
            setError('invitation_error');
          }
        } else {
          setCurrentStep('invite:code');
        }
      },

      // When the user returns from SSO
      RESUME_FLOW_AFTER_SSO: async (flow: 'signup' | 'signin') => {
        clearClaimTokens();
        const { requirements } = await getRequirements();
        const authenticationData = getAuthenticationData();

        const missingDataStep = checkMissingData(
          requirements,
          authenticationData,
          flow,
          true
        );

        if (missingDataStep) {
          setCurrentStep(missingDataStep);
          return;
        }

        if (flow === 'signup') {
          setCurrentStep('success');
        }

        const { successAction } = getAuthenticationData();
        if (successAction) {
          triggerSuccessAction(successAction);
        }
      },

      // When the authentication flow is triggered by an action
      // done by the user
      TRIGGER_AUTHENTICATION_FLOW: async (flow: 'signup' | 'signin') => {
        updateState({
          email: null,
          token: null,
          prefilledBuiltInFields: null,
          ssoProvider: null,
        });

        const { requirements, disabled_reason } = await getRequirements();
        const authenticationData = getAuthenticationData();

        const { permitted_by } = requirements.authentication;

        // This `disabled_reason === null` is a bit of a weird check,
        // because most of the times if there is no disabled reason,
        // you would never get into the authentication flow.
        // There are however some weird exceptions related to onboarding,
        // so we need to check for this.
        const signedIn =
          disabled_reason === null || disabled_reason !== 'user_not_signed_in';

        const isVerifiedActionFlow = permitted_by === 'verified';
        const userRequiresVerification = requirements.verification;

        if (isVerifiedActionFlow && (!signedIn || userRequiresVerification)) {
          setCurrentStep('sso-verification:sso-providers');
          return;
        }

        if (signedIn) {
          const missingDataStep = checkMissingData(
            requirements,
            authenticationData,
            flow,
            true
          );

          if (missingDataStep) {
            setCurrentStep(missingDataStep);
            return;
          }
        }

        setCurrentStep('email:start');
      },

      TRIGGER_VERIFICATION_ONLY: () => {
        setCurrentStep('verification-only');
      },

      TRIGGER_VERIFICATION_ERROR: (error_code?: VerificationError) => {
        const errorMap: Record<VerificationError, ErrorCode> = {
          not_entitled_under_minimum_age: 'verification_under_minimum_age',
          not_entitled_lives_outside: 'verification_lives_outside',
          not_entitled_no_match: 'auth_no_match',
          not_entitled_service_error: 'auth_service_error',
          taken: 'verification_taken',
        };

        if (error_code) {
          setCurrentStep('missing-data:verification');
          setError(errorMap[error_code]);
        } else {
          setCurrentStep('email:start');
          setError('unknown');
        }
      },

      TRIGGER_AUTH_ERROR: (error_code?: SignUpInError) => {
        const errorMap: Record<SignUpInError, ErrorCode> = {
          general: 'unknown',
          franceconnect_merging_failed: 'franceconnect_merging_failed',
          not_entitled_under_minimum_age: 'auth_under_minimum_age',
          not_entitled_lives_outside: 'auth_lives_outside',
          not_entitled_no_match: 'auth_no_match',
          not_entitled_service_error: 'auth_service_error',
        };

        setCurrentStep('email:start');
        if (error_code) {
          setError(errorMap[error_code]);
        } else {
          setError('unknown');
        }
      },

      TRIGGER_POST_PARTICIPATION_FLOW: async () => {
        setCurrentStep('post-participation:email');
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

    'access-denied': {
      CLOSE: () => setCurrentStep('closed'),
    },
  };
};
