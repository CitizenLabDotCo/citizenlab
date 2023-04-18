// i18n
import sharedMessages from '../messages';
import passwordInputMessages from 'components/UI/PasswordInput/messages';

// form
import { string, object } from 'yup';

// typings
import { FormatMessage } from 'typings';

export const DEFAULT_VALUES = {
  first_name: undefined,
  last_name: undefined,
  password: undefined,
} as const;

export const getSchema = (
  minimumPasswordLength: number,
  formatMessage: FormatMessage
) => {
  const schema = object({
    first_name: string().required(
      formatMessage(sharedMessages.emptyFirstNameError)
    ),
    last_name: string().required(
      formatMessage(sharedMessages.emptyLastNameError)
    ),
    password: string()
      .required(formatMessage(sharedMessages.noPasswordError))
      .test(
        '',
        formatMessage(passwordInputMessages.minimumPasswordLengthError, {
          minimumPasswordLength,
        }),
        (value) => !!(value && value.length >= minimumPasswordLength)
      ),
  });

  return schema;
};
