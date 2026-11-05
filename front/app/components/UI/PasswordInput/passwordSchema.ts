import { MessageDescriptor } from 'react-intl';
import { FormatMessage } from 'typings';
import { string } from 'yup';

import passwordInputMessages from './messages';

import { passwordMeetsStrength, passwordUserInputs } from './';

interface PasswordSchemaOptions {
  minimumPasswordLength: number;
  // Minimum zxcvbn score (0-4); falsy disables the strength check.
  minimumStrength?: number;
  // zxcvbn user_inputs known outside the form (e.g. stored account attributes),
  // merged with the sibling form fields (first/last/email, when present).
  staticUserInputs?: string[];
  // Empty-field message; defaults to "Please enter your password". Override for
  // flow-specific wording (e.g. "new").
  requiredMessage?: MessageDescriptor;
}

// Builds the Yup password schema (required + min length + zxcvbn strength)
// shared by the sign-up and password-change forms.
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
