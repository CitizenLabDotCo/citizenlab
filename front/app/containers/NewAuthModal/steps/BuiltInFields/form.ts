// i18n
import sharedMessages from '../messages';
import passwordInputMessages from 'components/UI/PasswordInput/messages';

// form
import { string, object } from 'yup';

// typings
import { FormatMessage } from 'typings';
import { IUserData } from 'services/users';

export const getDefaultValues = (authUser: IUserData) => {
  return {
    first_name: authUser.attributes.first_name ?? undefined,
    last_name: authUser.attributes.last_name ?? undefined,
    password: undefined,
  };
};

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
