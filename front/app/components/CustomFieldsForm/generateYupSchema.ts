import { FormatMessage } from 'typings';
import { array, number, object, string } from 'yup';

import { IFlatCustomField } from 'api/custom_fields/types';

import { Localize } from 'hooks/useLocalize';

import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';
import { lazy } from 'react';

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
    const {
      input_type,
      key,
      required,
      minimum_select_count,
      maximum_select_count,
      title_multiloc,
    } = question;

    switch (input_type) {
      case 'text_multiloc': {
        if (key === 'title_multiloc') {
          schema[key] = validateAtLeastOneLocale(
            formatMessage(messages.titleRequired),
            {
              validateEachNonEmptyLocale: (schema) =>
                schema
                  .min(3, formatMessage(messages.titleMinLength, { min: 3 }))
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
                  3, // I'm not seeing the error for this case
                  formatMessage(messages.descriptionMinLength, { min: 3 })
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
        if (key === 'location_description') {
          schema[key] = string().nullable();
        } else {
          schema[key] = required
            ? string().required(
                formatMessage(messages.fieldRequired, {
                  fieldName: localize(title_multiloc),
                })
              )
            : string();
        }
        break;
      }

      case 'number': {
        if (key === 'proposed_budget') {
          schema[key] = number().nullable();
        } else {
          schema[key] = required
            ? number().required(
                formatMessage(messages.fieldRequired, {
                  fieldName: localize(title_multiloc),
                })
              )
            : number();
        }
        break;
      }

      case 'select': {
        schema[key] = required
          ? string().required(
              formatMessage(messages.fieldRequired, {
                fieldName: localize(title_multiloc),
              })
            )
          : string();

        // Other option
        const fieldSchemaOther = string().when(key, {
          is: (value?: string) => value === 'other',
          then: string().required(
            formatMessage(messages.typeYourAnswerRequired)
          ),
          otherwise: string().notRequired(),
        });
        schema[`${key}_other`] = fieldSchemaOther;

        break;
      }

      case 'multiselect': {
        let fieldSchema = array().of(string());
        if (required) {
          fieldSchema = fieldSchema
            .required(
              formatMessage(messages.fieldRequired, {
                fieldName: localize(title_multiloc),
              })
            )
            .min(
              1,
              formatMessage(messages.fieldRequired, {
                fieldName: localize(title_multiloc),
              })
            );
        }

        if (minimum_select_count) {
          fieldSchema = fieldSchema.min(
            minimum_select_count,
            formatMessage(messages.fieldMinimum, {
              minSelections: minimum_select_count,
              fieldName: localize(title_multiloc),
            })
          );
        }
        if (maximum_select_count) {
          fieldSchema = fieldSchema.max(
            maximum_select_count,
            formatMessage(messages.fieldMaximum, {
              maxSelections: maximum_select_count,
              fieldName: localize(title_multiloc),
            })
          );
        }

        // Other option
        const fieldSchemaOther = string().when(key, {
          is: (value?: string[]) => value?.includes('other'),
          then: string().required(
            formatMessage(messages.typeYourAnswerRequired)
          ),
          otherwise: string().notRequired(),
        });

        schema[key] = fieldSchema;
        schema[`${key}_other`] = fieldSchemaOther;
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

      case 'linear_scale': {
        schema[key] = required
          ? number().required(
              formatMessage(messages.fieldRequired, {
                fieldName: localize(title_multiloc),
              })
            )
          : number();
        break;
      }

      case 'ranking': {
        const numberOfOptions = question.options?.length;

        // type guard, numberOfOptions should always be defined
        schema[key] =
          required && numberOfOptions !== undefined
            ? array()
                .of(string())
                .min(numberOfOptions, formatMessage(messages.fieldRequired))
                .max(numberOfOptions, formatMessage(messages.fieldRequired))
                .required(formatMessage(messages.topicRequired))
            : array().nullable();
        break;
      }

      case 'rating': {
        const maxRating = question.maximum;

        // type guard, maxRating should always be defined
        schema[key] =
          required && maxRating !== undefined
            ? number()
                .required(formatMessage(messages.fieldRequired))
                .min(1, formatMessage(messages.fieldRequired))
                .max(maxRating, formatMessage(messages.fieldRequired))
            : number();
        break;
      }

      case 'matrix_linear_scale': {
        // type guards, numberOfStatements and numberOfColumns should always be defined
        const numberOfStatements = question.matrix_statements?.length ?? 0;
        const numberOfColumns = question.maximum ?? 11;

        schema[key] = required
          ? object().test((object) => {
              if (!object) return false;
              const keys = Object.keys(object);
              const values = Object.values(object);
              const isValid =
                keys.length === numberOfStatements &&
                values.every((value) => {
                  return (
                    typeof value === 'number' &&
                    value >= 1 &&
                    value <= numberOfColumns
                  );
                });

              return isValid;
            })
          : object().nullable();
        break;
      }
    }
  });

  return object(schema);
};

export default generateYupValidationSchema;
