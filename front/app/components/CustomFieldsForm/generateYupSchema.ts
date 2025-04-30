import { FormatMessage } from 'typings';
import { array, number, object, string } from 'yup';

import { IFlatCustomField } from 'api/custom_fields/types';

import { Localize } from 'hooks/useLocalize';

import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';

const generateYupValidationSchema = ({
  pageQuestions,
  formatMessage,
  localize,
}: {
  pageQuestions: IFlatCustomField[];
  formatMessage: FormatMessage;
  localize: Localize;
}) => {
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
    if (question.input_type === 'html_multiloc') {
      if (question.key === 'body_multiloc') {
        schema[question.key] = validateAtLeastOneLocale(
          formatMessage(messages.descriptionRequired),
          {
            validateEachNonEmptyLocale: (schema) =>
              schema.min(
                40,
                formatMessage(messages.descriptionMinLength, {
                  min: 40,
                })
              ),
          }
        );
      } else {
        schema[question.key] = question.required
          ? validateAtLeastOneLocale(
              formatMessage(messages.descriptionRequired)
            )
          : {};
      }
    }
    if (question.input_type === 'text') {
      schema[question.key] = question.required
        ? string().required(
            formatMessage(messages.fieldRequired, {
              fieldName: localize(question.title_multiloc),
            })
          )
        : string();
    }
    if (question.input_type === 'number') {
      schema[question.key] = question.required
        ? number().required(
            formatMessage(messages.fieldRequired, {
              fieldName: localize(question.title_multiloc),
            })
          )
        : number();
    }
    if (question.input_type === 'image_files') {
      schema[question.key] = question.required
        ? array()
            .min(1, formatMessage(messages.imageRequired))
            .required(formatMessage(messages.imageRequired))
        : array().nullable();
    }
    if (question.input_type === 'files') {
      schema[question.key] = question.required
        ? array()
            .min(1, formatMessage(messages.fileRequired))
            .required(formatMessage(messages.fileRequired))
        : array().nullable();
    }
  });
  return object(schema);
};

export default generateYupValidationSchema;
