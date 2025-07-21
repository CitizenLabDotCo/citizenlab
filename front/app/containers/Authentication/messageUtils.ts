import { IFollowingAction } from 'api/authentication/authentication_requirements/types';
import { IPhasePermissionAction } from 'api/phase_permissions/types';

import errorMessages from 'components/UI/Error/messages';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';
import { ErrorCode } from './typings';
import useSteps from './useSteps';

type Step = ReturnType<typeof useSteps>['currentStep'];

const HEADER_MESSAGES: Record<Step, MessageDescriptor | null> = {
  // shared
  closed: null,
  success: null,
  'access-denied': messages.youCantParticipate,

  // sign in flow
  'sign-in:auth-providers': messages.logIn,
  'sign-in:email-password': messages.logIn,

  // full account creation sign up flow
  'sign-up:auth-providers': messages.signUp,
  'sign-up:email-password': messages.signUp,
  'sign-up:invite': messages.signUp,

  // light flow
  'light-flow:email': messages.beforeYouParticipate,
  'light-flow:email-policies': messages.beforeYouParticipate,
  'light-flow:sso-policies': messages.beforeYouParticipate,
  'light-flow:france-connect-login': messages.beforeYouParticipate,
  'light-flow:email-confirmation': messages.confirmYourEmail,
  'light-flow:password': messages.logIn,

  // missing data flow
  'missing-data:built-in': messages.completeYourProfile,
  'missing-data:email-confirmation': messages.confirmYourEmail,
  'missing-data:change-email': messages.confirmYourEmail,
  'missing-data:verification': messages.verifyYourIdentity,
  'missing-data:custom-fields': messages.completeYourProfile,
  'missing-data:onboarding': messages.whatAreYouInterestedIn,

  // verification only
  'verification-only': messages.verifyYourIdentity,
  'verification-success': null,

  // sso verification flow
  'sso-verification:sso-providers': messages.verificationRequired,
  'sso-verification:sso-providers-policies': messages.verificationRequired,
  'sso-verification:email-password': messages.logIn,
};

export const getHeaderMessage = (
  step: Step,
  action: 'visiting' | IPhasePermissionAction | IFollowingAction
) => {
  if (
    action === 'following' &&
    [
      'light-flow:email',
      'light-flow:email-policies',
      'light-flow:sso-policies',
      'light-flow:france-connect-login',
    ].includes(step)
  ) {
    return messages.beforeYouFollow;
  }
  return HEADER_MESSAGES[step];
};

export const ERROR_CODE_MESSAGES: Record<ErrorCode, MessageDescriptor> = {
  account_creation_failed: messages.unknownError,
  wrong_confirmation_code: errorMessages.confirmation_code_invalid,
  sign_in_failed: messages.signInError,
  requirements_fetching_failed: messages.unknownError,
  unknown: messages.unknownError,
  invitation_error: messages.invitationErrorText,
  franceconnect_merging_failed: messages.franceConnectMergingFailed,
  email_taken_and_user_can_be_verified: messages.emailTakenAndUserCanBeVerified,
  not_entitled_under_minimum_age:
    messages.nemlogInUnderMinimumAgeVerificationFailed,
  resending_code_failed: errorMessages.resending_code_failed,
  verification_taken: errorMessages.verification_taken,
};

type HelperTextKey = 'signup_helper_text' | 'custom_fields_signup_helper_text';

export const HELPER_TEXT_KEYS: Partial<Record<Step, HelperTextKey>> = {
  'sign-up:auth-providers': 'signup_helper_text',
  'sign-up:email-password': 'signup_helper_text',
  'missing-data:custom-fields': 'custom_fields_signup_helper_text',
};
