import { FormatMessage } from 'typings';
import { string, object, boolean } from 'yup';

import authProvidersMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';

import { getPasswordSchema } from 'components/UI/PasswordInput/passwordSchema';

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

export const getSchema = (
  minimumPasswordLength: number,
  formatMessage: FormatMessage,
  minimumStrength?: number
) => {
  const emailSchema = getEmailSchema(formatMessage);
  const passwordSchema = getPasswordSchema(formatMessage, {
    minimumPasswordLength,
    minimumStrength,
  });

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
