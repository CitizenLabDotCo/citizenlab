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

  // email flow
  'email:start': messages.beforeYouParticipate,
  'email:policies': messages.beforeYouParticipate,
  'email:password': messages.logIn,
  'email:sso-policies': messages.signUp,
  'email:confirmation': messages.confirmYourEmail,

  // invite flow
  'invite:email-password': messages.signUp,
  'invite:code': messages.signUp,
  'invite:taken': messages.signUp,

  // missing data flow
  'missing-data:built-in': messages.completeYourProfile,
  'missing-data:email-confirmation': messages.confirmYourEmail,
  'missing-data:verification': messages.verifyYourIdentity,
  'missing-data:custom-fields': messages.completeYourProfile,
  'missing-data:onboarding': messages.whatAreYouInterestedIn,

  // verification only
  'verification-only': messages.verifyYourIdentity,
  'verification-success': null,

  // sso verification flow
  'sso-verification:sso-providers': messages.verificationRequired,
  'sso-verification:sso-providers-policies': messages.verificationRequired,

  // post-participation flow
  'post-participation:email': messages.createAnAccount,
};

export const getHeaderMessage = (
  step: Step,
  action: 'visiting' | IPhasePermissionAction | IFollowingAction
) => {
  if (
    action === 'following' &&
    ['email:start', 'emailemail-policies', 'email:sso-policies'].includes(step)
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
  verification_under_minimum_age: messages.underMinimumAgeVerificationFailed,
  verification_lives_outside: messages.livesOutsideAreaVerificationFailed,
  verification_no_match: messages.noMatchVerificationFailed,
  verification_service_error: messages.serviceErrorVerificationFailed,
  auth_under_minimum_age: messages.underMinimumAgeAuthFailed,
  auth_lives_outside: messages.livesOutsideAreaAuthFailed,
  auth_no_match: messages.noMatchAuthFailed,
  auth_service_error: messages.serviceErrorAuthFailed,
  resending_code_failed: errorMessages.resending_code_failed,
  verification_taken: errorMessages.verification_taken,
};

type HelperTextKey =
  | 'enter_email_helper_text'
  | 'enter_password_helper_text'
  | 'complete_your_profile_helper_text'
  | 'custom_fields_signup_helper_text';

export const HELPER_TEXT_KEYS: Partial<Record<Step, HelperTextKey>> = {
  'email:start': 'enter_email_helper_text',
  'email:password': 'enter_password_helper_text',
  'missing-data:built-in': 'complete_your_profile_helper_text',
  'missing-data:custom-fields': 'custom_fields_signup_helper_text',
};
