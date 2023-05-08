// i18n
import sharedMessages from '../messages';

// form
import { string, object } from 'yup';

// utils
import { isValidEmail } from 'utils/validate';

// typings
import { FormatMessage } from 'typings';

export interface FormValues {
  email: string;
  termsAndConditionsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

export const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
  termsAndConditionsAccepted: false,
  privacyPolicyAccepted: false,
};

export const getSchema = (formatMessage: FormatMessage) => {
  const emailSchema = string()
    .required(formatMessage(sharedMessages.emailMissingError))
    .email(formatMessage(sharedMessages.emailFormatError))
    .test('', formatMessage(sharedMessages.emailFormatError), isValidEmail);

  const schema = object({
    email: emailSchema,
    // termsAndConditionsAccepted: boolean().test(
    //   '',
    //   formatMessage(authProvidersMessages.tacError),
    //   isTruthy
    // ),
    // privacyPolicyAccepted: boolean().test(
    //   '',
    //   formatMessage(authProvidersMessages.privacyPolicyNotAcceptedError),
    //   isTruthy
    // ),
  });

  return schema;
};
