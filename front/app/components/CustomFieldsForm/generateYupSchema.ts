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

      case 'select': {
        // Should we also enum the option keys?
        schema[key] = required
          ? string().required(
              formatMessage(messages.fieldRequired, {
                fieldName: localize(title_multiloc),
              })
            )
          : string();
        break;
      }

      case 'multiselect': {
        // Should we also enum the option keys?
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
        } else {
          fieldSchema = fieldSchema.default([]);
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

        schema[key] = fieldSchema;
        break;
      }

      case 'image_files': {
        schema[key] = required
          ? array()
              .min(1, formatMessage(messages.imageRequired))
              .required(formatMessage(messages.imageRequired))
              .transform((value) => {
                if (value) {
                  return value.map((image) => {
                    if (image.base64) {
                      return { image: image.base64 };
                    }
                    return null;
                  });
                }
                return null;
              })
          : array()
              .nullable()
              .transform((value) => {
                if (value) {
                  return value.map((image) => {
                    if (image.base64) {
                      return { image: image.base64 };
                    }
                    return null;
                  });
                }
                return null;
              });
        break;
      }

      case 'files': {
        schema[key] = required
          ? array()
              .min(1, formatMessage(messages.fileRequired))
              .required(formatMessage(messages.fileRequired))
              .transform((value) => {
                if (value) {
                  return value.map((file) => {
                    if (file.base64 && file.filename) {
                      return {
                        file_by_content: {
                          content: file.base64,
                          name: file.filename,
                        },
                        name: file.filename,
                      };
                    }
                    return null;
                  });
                }
                return null;
              })
          : array()
              .nullable()
              .transform((value) => {
                if (value) {
                  return value.map((file) => {
                    if (file.base64 && file.filename) {
                      return {
                        file_by_content: {
                          content: file.base64,
                          name: file.filename,
                        },
                        name: file.filename,
                      };
                    }
                    return null;
                  });
                }
                return null;
              });
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
