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
  const schema: Record<string, any> = {};

  pageQuestions.forEach((question) => {
    const { input_type, key, required, title_multiloc } = question;

    switch (input_type) {
      case 'text_multiloc': {
        if (key === 'title_multiloc') {
          schema[key] = validateAtLeastOneLocale(
            formatMessage(messages.titleRequired),
            {
              validateEachNonEmptyLocale: (schema) =>
                schema
                  .min(10, formatMessage(messages.titleMinLength, { min: 10 }))
                  .max(
                    120,
                    formatMessage(messages.titleMaxLength, { max: 120 })
                  ),
            }
          );
        } else {
          schema[key] = required
            ? validateAtLeastOneLocale(formatMessage(messages.titleRequired))
            : {};
        }
        break;
      }

      case 'html_multiloc': {
        if (key === 'body_multiloc') {
          schema[key] = validateAtLeastOneLocale(
            formatMessage(messages.descriptionRequired),
            {
              validateEachNonEmptyLocale: (schema) =>
                schema.min(
                  40,
                  formatMessage(messages.descriptionMinLength, { min: 40 })
                ),
            }
          );
        } else {
          schema[key] = required
            ? validateAtLeastOneLocale(
                formatMessage(messages.descriptionRequired)
              )
            : {};
        }
        break;
      }

      case 'text':
      case 'multiline_text': {
        schema[key] = required
          ? string().required(
              formatMessage(messages.fieldRequired, {
                fieldName: localize(title_multiloc),
              })
            )
          : string();
        break;
      }

      case 'number': {
        schema[key] = required
          ? number().required(
              formatMessage(messages.fieldRequired, {
                fieldName: localize(title_multiloc),
              })
            )
          : number();
        break;
      }

      case 'image_files': {
        schema[key] = required
          ? array()
              .min(1, formatMessage(messages.imageRequired))
              .required(formatMessage(messages.imageRequired))
          : array().nullable();
        break;
      }

      case 'files': {
        schema[key] = required
          ? array()
              .min(1, formatMessage(messages.fileRequired))
              .required(formatMessage(messages.fileRequired))
          : array().nullable();
        break;
      }

      case 'topic_ids': {
        schema[key] = required
          ? array()
              .of(string())
              .min(1, formatMessage(messages.topicRequired))
              .required(formatMessage(messages.topicRequired))
          : array().nullable();
        break;
      }
    }
  });

  return object(schema);
};

export default generateYupValidationSchema;
