// i18n
import sharedMessages from '../messages';
import passwordInputMessages from 'components/UI/PasswordInput/messages';

// form
import { string, object } from 'yup';

// utils
import { isValidEmail, isValidPhoneNumber } from 'utils/validate';

// typings
import { FormatMessage } from 'typings';

export interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export const DEFAULT_VALUES: Partial<FormValues> = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
  password: undefined,
};

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
    // TODO
  });

  return schema;
};
