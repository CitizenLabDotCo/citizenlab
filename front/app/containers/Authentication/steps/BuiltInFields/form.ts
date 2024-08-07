import { FormatMessage } from 'typings';
import { string, object } from 'yup';

import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';

import passwordInputMessages from 'components/UI/PasswordInput/messages';

import sharedMessages from '../messages';

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
  requirements: AuthenticationRequirements
) => {
  const missingAttributes = new Set(
    requirements.requirements.authentication.missing_user_attributes
  );

  const schema = object({
    ..._if(
      missingAttributes.has('first_name'),
      'first_name',
      string().required(formatMessage(sharedMessages.emptyFirstNameError))
    ),

    ..._if(
      missingAttributes.has('last_name'),
      'last_name',
      string().required(formatMessage(sharedMessages.emptyLastNameError))
    ),

    ..._if(
      missingAttributes.has('password'),
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
