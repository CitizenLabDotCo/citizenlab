import { ISignUpInMetaData } from 'components/SignUpIn';
import { TAuthUser } from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';

export default function determineSignUpStep(
  metaData: ISignUpInMetaData,
  authUser: TAuthUser,
  emailSignupSelected: boolean,
  customFieldsActive: boolean,
  userCustomFieldsSchema,
  initialSignUp: boolean
) {
  // No user has been created yet
  if (isNilOrError(authUser)) {
    // We got an invite, and we have a token
    if (metaData.isInvitation && metaData.token) {
      return 'password-signup';
    }

    // We still have to choose an auth provider
    if (!emailSignupSelected) return 'auth-providers';

    // We chose email as auth provider
    return 'password-signup';
  }

  // We completed email signup but still need to confirm email
  if (authUser.attributes.confirmation_required) {
    return 'confirmation';
  }

  // We entered the sign up flow from a place that demands verification,
  // AND we have not been verified yet
  const verificationRequired = metaData.verification;

  if (verificationRequired && !authUser.attributes.verified) {
    return 'verification';
  }

  // The custom fields module is active
  if (customFieldsActive) {
    // If it has required fields
    if (userCustomFieldsSchema.hasRequiredFields) {
      return 'custom-fields';
    }

    // It has no required fields, but it has fields,
    // AND this is the initial sign up (i.e. the user signed
    // up and finished it at once, without refreshing etc)
    if (userCustomFieldsSchema.hasCustomFields && initialSignUp) {
      return 'custom-fields';
    }
  }

  return 'success';
}
