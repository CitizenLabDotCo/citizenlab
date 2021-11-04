import { TSignUpStep } from '..';

export default function determineIfSignUpCompleted(
  stepThatWasJustCompleted: TSignUpStep,
  userCustomFieldsSchema,
  userJustCameBackFromSSO: boolean
) {
  if (
    stepThatWasJustCompleted === 'custom-fields' &&
    userCustomFieldsSchema.hasRequiredFields
  ) {
    return true;
  }

  if (userJustCameBackFromSSO) {
    return true;
  }

  if (stepThatWasJustCompleted === 'confirmation') {
    return true;
  }

  return false;
}
