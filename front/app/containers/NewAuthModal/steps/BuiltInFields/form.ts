// i18n
import sharedMessages from '../messages';
import passwordInputMessages from 'components/UI/PasswordInput/messages';

// form
import { string, object } from 'yup';

// typings
import { FormatMessage } from 'typings';
import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';

export const DEFAULT_VALUES = {
  first_name: undefined,
  last_name: undefined,
  password: undefined,
} as const;

const _if = (condition: boolean, key: string, value: any) => {
  return condition ? { [key]: value } : {};
};

export const getSchema = (
  minimumPasswordLength: number,
  formatMessage: FormatMessage,
  { requirements }: AuthenticationRequirements
) => {
  const schema = object({
    ..._if(
      requirements.built_in.first_name === 'require',
      'first_name',
      string().required(formatMessage(sharedMessages.emptyFirstNameError))
    ),

    ..._if(
      requirements.built_in.last_name === 'require',
      'last_name',
      string().required(formatMessage(sharedMessages.emptyLastNameError))
    ),

    ..._if(
      requirements.special.password === 'require',
      'password',
      string()
        .required(formatMessage(sharedMessages.noPasswordError))
        .test(
          '',
          formatMessage(passwordInputMessages.minimumPasswordLengthError, {
            minimumPasswordLength,
          }),
          (value) => !!(value && value.length >= minimumPasswordLength)
        )
    ),
  });

  return schema;
};
