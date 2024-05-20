import { FormatMessage } from 'typings';
import { string, object, boolean } from 'yup';

import authProvidersMessages from 'containers/Authentication/steps/AuthProviders/messages';

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

export const getSchema = (
  minimumPasswordLength: number,
  formatMessage: FormatMessage
) => {
  const emailSchema = string()
    .required(formatMessage(sharedMessages.emailMissingError))
    .email(formatMessage(sharedMessages.emailFormatError))
    .test('', formatMessage(sharedMessages.emailFormatError), isValidEmail);

  const schema = object({
    first_name: string().required(
      formatMessage(sharedMessages.emptyFirstNameError)
    ),
    last_name: string().required(
      formatMessage(sharedMessages.emptyLastNameError)
    ),
    email: emailSchema,
    password: string()
      .required(formatMessage(sharedMessages.noPasswordError))
      .test(
        '',
        formatMessage(passwordInputMessages.minimumPasswordLengthError, {
          minimumPasswordLength,
        }),
        (value) => !!(value && value.length >= minimumPasswordLength)
      ),
    termsAndConditionsAccepted: boolean().test(
      '',
      formatMessage(authProvidersMessages.tacError),
      isTruthy
    ),
    privacyPolicyAccepted: boolean().test(
      '',
      formatMessage(authProvidersMessages.privacyPolicyNotAcceptedError),
      isTruthy
    ),
  });

  return schema;
};
