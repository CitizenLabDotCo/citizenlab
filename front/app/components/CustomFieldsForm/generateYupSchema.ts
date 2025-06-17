import { FormatMessage } from 'typings';
import { array, number, object, string } from 'yup';

import { IFlatCustomField } from 'api/custom_fields/types';

import { Localize } from 'hooks/useLocalize';

import legacyMessages from 'components/Form/Components/Controls/messages';

import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';

// NOTE: When the question is a built-in field, it is necessary to
// check the `enabled` property before adding it to the schema.

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
      enabled,
    } = question;

    const title = localize(title_multiloc);
    const fieldRequired = formatMessage(messages.fieldRequired, {
      fieldName: title,
    });

    switch (input_type) {
      case 'text_multiloc': {
        if (key === 'title_multiloc' && enabled) {
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
        if (key === 'body_multiloc' && enabled) {
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
        if (key === 'location_description' && enabled) {
          schema[key] = required
            ? string().required(fieldRequired).nullable()
            : string().nullable();
        } else {
          schema[key] = required ? string().required(fieldRequired) : string();
        }
        break;
      }

      case 'number': {
        if (key === 'project_budget' && enabled) {
          schema[key] = required
            ? number().required(fieldRequired)
            : number()
                .transform((value, originalValue) =>
                  originalValue === '' ? null : value
                )
                .nullable();
        }

        schema[key] = required
          ? number().required(fieldRequired)
          : number()
              .transform((value, originalValue) =>
                originalValue === '' ? null : value
              )
              .nullable();
        break;
      }

      case 'select': {
        schema[key] = required ? string().required(fieldRequired) : string();

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

      case 'multiselect':
      case 'multiselect_image': {
        let fieldSchema = array().of(string());
        if (required) {
          fieldSchema = fieldSchema.required(fieldRequired).min(
            1,
            formatMessage(messages.fieldRequired, {
              fieldName: title,
            })
          );
        }

        if (minimum_select_count) {
          fieldSchema = fieldSchema.min(
            minimum_select_count,
            formatMessage(messages.fieldMinimum, {
              minSelections: minimum_select_count,
              fieldName: title,
            })
          );
        }
        if (maximum_select_count) {
          fieldSchema = fieldSchema.max(
            maximum_select_count,
            formatMessage(messages.fieldMaximum, {
              maxSelections: maximum_select_count,
              fieldName: title,
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
        schema[key] =
          required && enabled
            ? array()
                .min(1, formatMessage(messages.imageRequired))
                .required(formatMessage(messages.imageRequired))
                .nullable()
            : array().nullable();

        break;
      }

      case 'files': {
        schema[key] =
          required && enabled
            ? array()
                .min(1, formatMessage(messages.fileRequired))
                .required(formatMessage(messages.fileRequired))
            : array().nullable();

        break;
      }

      case 'topic_ids': {
        schema[key] =
          required && enabled
            ? array()
                .of(string())
                .min(1, formatMessage(messages.topicRequired))
                .required(formatMessage(messages.topicRequired))
            : array().nullable();
        break;
      }

      case 'linear_scale': {
        schema[key] = required ? number().required(fieldRequired) : number();
        break;
      }

      case 'ranking': {
        const numberOfOptions = question.options?.length;

        // type guard, numberOfOptions should always be defined
        schema[key] =
          required && numberOfOptions !== undefined
            ? array()
                .of(string())
                .min(numberOfOptions, fieldRequired)
                .max(numberOfOptions, fieldRequired)
                .required(fieldRequired)
            : array().nullable();
        break;
      }

      case 'rating': {
        const maxRating = question.maximum;

        // type guard, maxRating should always be defined
        schema[key] =
          required && maxRating !== undefined
            ? number()
                .required(fieldRequired)
                .min(1, fieldRequired)
                .max(maxRating, fieldRequired)
            : number();
        break;
      }

      case 'matrix_linear_scale': {
        // type guards, numberOfStatements and numberOfColumns should always be defined
        const numberOfStatements = question.matrix_statements?.length ?? 0;
        const numberOfColumns = question.maximum ?? 11;

        schema[key] = required
          ? object().test({
              message: formatMessage(legacyMessages.allStatementsError),
              test: (object) => {
                if (typeof object !== 'object') {
                  return false;
                }
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
              },
            })
          : object().nullable();
        break;
      }

      case 'cosponsor_ids': {
        schema[key] =
          required && enabled
            ? array().of(string()).required(fieldRequired).min(1, fieldRequired)
            : array().nullable();
        break;
      }

      case 'sentiment_linear_scale': {
        schema[key] = required
          ? number()
              .min(1, fieldRequired)
              .max(5, fieldRequired)
              .required(fieldRequired)
          : number();

        // follow up field (never required)
        schema[`${key}_follow_up`] = string();

        break;
      }
    }
  });

  return object(schema);
};

export default generateYupValidationSchema;
