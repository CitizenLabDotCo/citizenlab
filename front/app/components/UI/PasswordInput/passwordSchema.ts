import { MessageDescriptor } from 'react-intl';
import { FormatMessage } from 'typings';
import { string } from 'yup';

import passwordInputMessages from './messages';

import { passwordMeetsStrength, passwordUserInputs } from './';

interface PasswordSchemaOptions {
  minimumPasswordLength: number;
  // Minimum zxcvbn score (0-4); falsy disables the strength check.
  minimumStrength?: number;
  // zxcvbn user_inputs known outside the form (e.g. stored account attributes).
  // Merged with the sibling form fields (first/last/email, when present), so the
  // strength check penalises them like the backend does.
  staticUserInputs?: string[];
  // Message shown when the field is empty. Defaults to a generic "Please enter
  // your password"; pass an override for flow-specific wording (e.g. "new").
  requiredMessage?: MessageDescriptor;
}

// Builds the Yup string schema shared by the sign-up and password-change forms:
// required, minimum length, and the zxcvbn strength check in one place.
export function getPasswordSchema(
  formatMessage: FormatMessage,
  {
    minimumPasswordLength,
    minimumStrength,
    staticUserInputs = [],
    requiredMessage = passwordInputMessages.passwordRequiredError,
  }: PasswordSchemaOptions
) {
  return string()
    .required(formatMessage(requiredMessage))
    .min(
      minimumPasswordLength,
      formatMessage(passwordInputMessages.minimumPasswordLengthError, {
        minimumPasswordLength,
      })
    )
    .test(
      'password-strength',
      formatMessage(passwordInputMessages.passwordStrengthError),
      (value, context) =>
        passwordMeetsStrength(value, minimumStrength, [
          ...passwordUserInputs(context.parent),
          ...staticUserInputs,
        ])
    );
}
