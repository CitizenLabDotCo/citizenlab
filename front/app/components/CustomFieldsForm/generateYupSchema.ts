import { FormatMessage } from 'typings';
import { number, object, string } from 'yup';

import { IFlatCustomField } from 'api/custom_fields/types';

import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';

const generateYupValidationSchema = (
  pageQuestions: IFlatCustomField[],
  formatMessage: FormatMessage
) => {
  const schema: any = {};
  pageQuestions.forEach((question) => {
    if (question.input_type === 'text_multiloc') {
      if (question.key === 'title_multiloc') {
        schema[question.key] = validateAtLeastOneLocale(
          formatMessage(messages.titleRequired),
          {
            validateEachNonEmptyLocale: (schema) =>
              schema
                .min(
                  10,
                  formatMessage(messages.titleMinLength, {
                    min: 10,
                  })
                )
                .max(
                  120,
                  formatMessage(messages.titleMaxLength, {
                    max: 120,
                  })
                ),
          }
        );
      } else {
        schema[question.key] = question.required
          ? validateAtLeastOneLocale(formatMessage(messages.titleRequired))
          : {};
      }
    }
    if (question.input_type === 'text') {
      schema[question.key] = question.required
        ? string().required(formatMessage(messages.titleRequired))
        : {};
    }
    if (question.input_type === 'number') {
      schema[question.key] = question.required
        ? number().required(formatMessage(messages.titleRequired))
        : {};
    }
  });
  return object(schema);
};

export default generateYupValidationSchema;
