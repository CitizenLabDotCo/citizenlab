import { FormatMessage } from 'typings';
import { string, object } from 'yup';

import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';

import { getEmailSchema, getPasswordSchema } from '../InviteSignUp/form';
import sharedMessages from '../messages';

export const DEFAULT_VALUES = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
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
      missingAttributes.has('email'),
      'email',
      getEmailSchema(formatMessage)
    ),

    ..._if(
      missingAttributes.has('password'),
      'password',
      getPasswordSchema(minimumPasswordLength, formatMessage)
    ),
  });

  return schema;
};
