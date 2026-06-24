import { FormatMessage } from 'typings';
import { string, object, boolean } from 'yup';

import authProvidersMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';

import {
  passwordMeetsStrength,
  passwordUserInputs,
} from 'components/UI/PasswordInput';
import passwordInputMessages from 'components/UI/PasswordInput/messages';

import { isValidEmail } from 'utils/validate';

import sharedMessages from '../messages';

export interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  termsAndConditionsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

export const DEFAULT_VALUES: Partial<FormValues> = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
  password: undefined,
  termsAndConditionsAccepted: false,
  privacyPolicyAccepted: false,
};

const isTruthy = (value?: boolean) => !!value;

export const getEmailSchema = (formatMessage: FormatMessage) =>
  string()
    .required(formatMessage(sharedMessages.emailMissingError))
    .email(formatMessage(sharedMessages.emailFormatError))
    .test('', formatMessage(sharedMessages.emailFormatError), isValidEmail);

export const getPasswordSchema = (
  minimumPasswordLength: number,
  formatMessage: FormatMessage,
  minimumStrength?: number,
  // Extra user_inputs not in this form (e.g. an already-known email), merged
  // with the in-form fields so the strength check penalises them like the backend.
  extraUserInputs: string[] = []
) =>
  string()
    .required(formatMessage(sharedMessages.noPasswordError))
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
          ...extraUserInputs,
        ])
    );

export const getSchema = (
  minimumPasswordLength: number,
  formatMessage: FormatMessage,
  minimumStrength?: number
) => {
  const emailSchema = getEmailSchema(formatMessage);
  const passwordSchema = getPasswordSchema(
    minimumPasswordLength,
    formatMessage,
    minimumStrength
  );

  const schema = object({
    first_name: string().required(
      formatMessage(sharedMessages.emptyFirstNameError)
    ),
    last_name: string().required(
      formatMessage(sharedMessages.emptyLastNameError)
    ),
    email: emailSchema,
    password: passwordSchema,
    termsAndConditionsAccepted: boolean()
      .test('', formatMessage(authProvidersMessages.tacError), isTruthy)
      .required(),
    privacyPolicyAccepted: boolean()
      .test(
        '',
        formatMessage(authProvidersMessages.privacyPolicyNotAcceptedError),
        isTruthy
      )
      .required(),
  });

  return schema;
};
