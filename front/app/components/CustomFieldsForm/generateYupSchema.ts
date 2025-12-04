import { FormatMessage } from 'typings';
import { array, number, object, string } from 'yup';

import { IFlatCustomField } from 'api/custom_fields/types';

import { Localize } from 'hooks/useLocalize';

import { getPlainTextLengthFromHTML } from 'components/UI/QuillEditor/utils';

import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import { convertWKTToGeojson } from './Fields/MapField/multiPointUtils';
import messages from './messages';

// Helper function to validate HTML content with character limits
const validateHTMLWithCharacterLimits = (
  schema: any,
  formatMessage: FormatMessage,
  title: string,
  minCharCount?: number,
  maxCharCount?: number
) => {
  let fieldSchema = schema;

  if (minCharCount) {
    fieldSchema = fieldSchema.test(
      'min-characters',
      formatMessage(messages.fieldMinLength, {
        min: minCharCount,
        fieldName: title,
      }),
      (value: string) => {
        if (!value) return true; // Let required validation handle empty values
        const plainTextLength = getPlainTextLengthFromHTML(value);
        return plainTextLength >= minCharCount;
      }
    );
  }

  if (maxCharCount) {
    fieldSchema = fieldSchema.test(
      'max-characters',
      formatMessage(messages.fieldMaxLength, {
        max: maxCharCount,
        fieldName: title,
      }),
      (value: string) => {
        if (!value) return true; // Let required validation handle empty values
        const plainTextLength = getPlainTextLengthFromHTML(value);
        return plainTextLength <= maxCharCount;
      }
    );
  }

  return fieldSchema;
};

// NOTE: When the question is a built-in field, it is necessary to
// check the `enabled` property before adding it to the schema.

const generateYupSchema = ({
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
      min_characters,
      max_characters,
    } = question;

    const title = localize(title_multiloc);
    const fieldRequired = formatMessage(messages.fieldRequired, {
      fieldName: title,
    });

    switch (input_type) {
      case 'text_multiloc':
      case 'html_multiloc': {
        const requiredMessage =
          input_type === 'text_multiloc'
            ? formatMessage(messages.titleRequired)
            : formatMessage(messages.descriptionRequired);

        schema[key] =
          enabled && required
            ? validateAtLeastOneLocale(requiredMessage, {
                validateEachNonEmptyLocale: (schema) => {
                  let fieldSchema = schema;

                  if (input_type === 'text_multiloc') {
                    // Apply standard character limits to text_multiloc
                    if (min_characters) {
                      fieldSchema = fieldSchema.min(
                        min_characters,
                        formatMessage(messages.fieldMinLength, {
                          min: min_characters,
                          fieldName: title,
                        })
                      );
                    }

                    if (max_characters) {
                      fieldSchema = fieldSchema.max(
                        max_characters,
                        formatMessage(messages.fieldMaxLength, {
                          max: max_characters,
                          fieldName: title,
                        })
                      );
                    }
                  } else {
                    // Apply HTML-aware character limits to html_multiloc
                    fieldSchema = validateHTMLWithCharacterLimits(
                      fieldSchema,
                      formatMessage,
                      title,
                      min_characters,
                      max_characters
                    );
                  }

                  return fieldSchema;
                },
              })
            : object();
        break;
      }

      case 'text':
      case 'multiline_text':
      case 'date': {
        let fieldSchema = string();

        if (required) {
          fieldSchema = fieldSchema
            .required(fieldRequired)
            .trim() // Removes leading/trailing whitespace before validation
            .min(1, fieldRequired); // Ensures at least one character after trimming
        }

        if (min_characters) {
          fieldSchema = fieldSchema.test(
            'min-characters',
            formatMessage(messages.fieldMinLength, {
              min: min_characters,
              fieldName: title,
            }),
            (value: string) => {
              if (!value) return true; // Let required validation handle empty values
              return value.length >= min_characters;
            }
          );
        }

        if (max_characters) {
          fieldSchema = fieldSchema.test(
            'max-characters',
            formatMessage(messages.fieldMaxLength, {
              max: max_characters,
              fieldName: title,
            }),
            (value: string) => {
              if (!value) return true; // Let required validation handle empty values
              return value.length <= max_characters;
            }
          );
        }

        if (key === 'location_description') {
          schema[key] = fieldSchema.nullable();
        } else {
          schema[key] = fieldSchema;
        }
        break;
      }

      case 'number': {
        if (key === 'proposed_budget') {
          schema[key] =
            required && enabled
              ? number()
                  .transform((value, originalValue) =>
                    originalValue === '' ? null : value
                  )
                  .required(fieldRequired)
              : number()
                  .transform((value, originalValue) =>
                    originalValue === '' ? null : value
                  )
                  .nullable();
        } else if (key === 'birthyear') {
          schema[key] = required
            ? number()
                .transform((value, originalValue) =>
                  originalValue === '' ? null : value
                )
                .min(1900, formatMessage(messages.birthyearTooLow))
                .max(
                  new Date().getFullYear(),
                  formatMessage(messages.birthyearTooHigh)
                )
                .required(fieldRequired)
            : number()
                .transform((value, originalValue) =>
                  originalValue === '' ? null : value
                )
                .min(1900, formatMessage(messages.birthyearTooLow))
                .max(
                  new Date().getFullYear(),
                  formatMessage(messages.birthyearTooHigh)
                )
                .nullable();
        } else {
          schema[key] = required
            ? number()
                .transform((value, originalValue) =>
                  originalValue === '' ? null : value
                )
                .required(fieldRequired)
            : number()
                .transform((value, originalValue) =>
                  originalValue === '' ? null : value
                )
                .nullable();
        }
        break;
      }

      case 'select': {
        schema[key] = required ? string().required(fieldRequired) : string();

        // Other option
        const fieldSchemaOther = string().when(key, ([value], schema) => {
          return value === 'other'
            ? schema.required(formatMessage(messages.typeYourAnswerRequired))
            : schema.notRequired();
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
        const fieldSchemaOther = string().when(key, ([value], schema) => {
          if (!Array.isArray(value)) return schema.notRequired();

          return value.includes('other')
            ? schema.required(formatMessage(messages.typeYourAnswerRequired))
            : schema.notRequired();
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
        let fieldSchema = array().of(string());

        if (required && enabled) {
          fieldSchema = fieldSchema
            .min(1, formatMessage(messages.topicRequired))
            .required(formatMessage(messages.topicRequired));
        }

        if (minimum_select_count) {
          fieldSchema = fieldSchema.min(
            minimum_select_count,
            formatMessage(messages.topicMinimum, {
              minSelections: minimum_select_count,
              fieldName: title,
            })
          );
        }

        if (maximum_select_count) {
          fieldSchema = fieldSchema.max(
            maximum_select_count,
            formatMessage(messages.topicMaximum, {
              maxSelections: maximum_select_count,
              fieldName: title,
            })
          );
        }

        schema[key] = fieldSchema.nullable();
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
              message: formatMessage(messages.allStatementsError),
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

      case 'checkbox': {
        schema[key] = required
          ? string().test({
              message: fieldRequired,
              test: (value) => value === 'true',
            })
          : string().nullable();
        break;
      }

      case 'file_upload':
      case 'shapefile_upload': {
        schema[key] = required
          ? object().required(fieldRequired).nullable()
          : object().nullable();
        break;
      }

      case 'point': {
        schema[key] = required
          ? string().required(fieldRequired)
          : string().nullable();
        break;
      }

      case 'line': {
        const line = string().test({
          message: formatMessage(messages.atLeastTwoPointsRequired),
          test: (value) => {
            if (!value) return true;
            const converted = convertWKTToGeojson({ line: value });
            return (
              converted.line &&
              converted.line.type === 'LineString' &&
              Array.isArray(converted.line.coordinates) &&
              converted.line.coordinates.length > 1
            );
          },
        });
        schema[key] = required ? line.required(fieldRequired) : line.nullable();
        break;
      }

      case 'polygon': {
        const polygon = string().test({
          message: formatMessage(messages.atLeastThreePointsRequired),
          test: (value) => {
            if (!value) return true;
            const converted = convertWKTToGeojson({ polygon: value });
            return (
              converted.polygon &&
              converted.polygon.type === 'Polygon' &&
              Array.isArray(converted.polygon.coordinates) &&
              converted.polygon.coordinates.length > 0 &&
              converted.polygon.coordinates[0].length > 3
            );
          },
        });
        schema[key] = required
          ? polygon.required(fieldRequired)
          : polygon.nullable();
        break;
      }
    }
  });

  return object(schema);
};

export default generateYupSchema;
