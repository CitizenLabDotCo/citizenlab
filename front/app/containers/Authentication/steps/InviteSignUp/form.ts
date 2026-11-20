import { FormatMessage } from 'typings';
import { string, object, boolean, StringSchema } from 'yup';

import authProvidersMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';

import { getPasswordSchema } from 'components/UI/PasswordInput/passwordSchema';

import { isValidEmail } from 'utils/validate';

import sharedMessages from '../messages';

export interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  policiesAccepted: boolean;
}

// Before validation Yup expects the optional password key to be there, even if undefined.
export type FormInput = Omit<FormValues, 'password'> & {
  password: string | undefined;
};

export const DEFAULT_VALUES: Partial<FormValues> = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
  password: undefined,
  policiesAccepted: false,
};

const isTruthy = (value?: boolean) => !!value;

export const getEmailSchema = (formatMessage: FormatMessage) =>
  string()
    .required(formatMessage(sharedMessages.emailMissingError))
    .email(formatMessage(sharedMessages.emailFormatError))
    .test('', formatMessage(sharedMessages.emailFormatError), isValidEmail);

export const getSchema = (
  minimumPasswordLength: number,
  formatMessage: FormatMessage,
  askPassword: boolean,
  minimumStrength?: number
) => {
  const emailSchema = getEmailSchema(formatMessage);
  const passwordSchema: StringSchema<string | undefined> = askPassword
    ? getPasswordSchema(formatMessage, {
        minimumPasswordLength,
        minimumStrength,
      })
    : string();

  const schema = object({
    first_name: string().required(
      formatMessage(sharedMessages.emptyFirstNameError)
    ),
    last_name: string().required(
      formatMessage(sharedMessages.emptyLastNameError)
    ),
    email: emailSchema,
    password: passwordSchema,
    policiesAccepted: boolean()
      .test(
        '',
        formatMessage(authProvidersMessages.policiesNotAcceptedError),
        isTruthy
      )
      .required(),
  });

  return schema;
};
