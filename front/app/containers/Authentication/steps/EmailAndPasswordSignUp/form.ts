// i18n
import sharedMessages from '../messages';
import passwordInputMessages from 'components/UI/PasswordInput/messages';
import authProvidersMessages from 'containers/Authentication/steps/AuthProviders/messages';

// form
import { string, object, boolean } from 'yup';

// utils
import { isValidEmail, isValidPhoneNumber } from 'utils/validate';

// typings
import { FormatMessage } from 'typings';

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
  phoneLoginEnabled: boolean,
  minimumPasswordLength: number,
  formatMessage: FormatMessage
) => {
  const emailSchema = phoneLoginEnabled
    ? string()
        .required(formatMessage(sharedMessages.emailOrPhoneMissingError))
        .test(
          '',
          formatMessage(sharedMessages.emailOrPhoneNumberError),
          (value) => {
            if (value === undefined) return false;
            return isValidEmail(value) || isValidPhoneNumber(value);
          }
        )
    : string()
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
