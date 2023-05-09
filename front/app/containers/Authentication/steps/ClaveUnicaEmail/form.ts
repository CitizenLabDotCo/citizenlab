import sharedMessages from '../messages';
import { string, object } from 'yup';
import { isValidEmail } from 'utils/validate';
import { FormatMessage } from 'typings';

export interface FormValues {
  email: string;
}

export const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
};

export const getSchema = (formatMessage: FormatMessage) => {
  const emailSchema = string()
    .required(formatMessage(sharedMessages.emailMissingError))
    .email(formatMessage(sharedMessages.emailFormatError))
    .test('', formatMessage(sharedMessages.emailFormatError), isValidEmail);

  const schema = object({
    email: emailSchema,
  });

  return schema;
};
