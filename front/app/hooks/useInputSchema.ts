import { Layout } from '@jsonforms/core';
import { useEffect, useState } from 'react';
import {
  ideaJsonFormsSchemaStream,
  JsonFormsSchema,
} from 'services/ideaJsonFormsSchema';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfigurationLocales from './useAppConfigurationLocales';
import useLocale from './useLocale';

export default (projectId: string | undefined) => {
  const [schema, setSchema] = useState<JsonFormsSchema | null>(null);
  const [uiSchema, setUiSchema] = useState<Layout | null>(null);
  const [isError, setIsError] = useState(false);
  const locale = useLocale();
  const locales = useAppConfigurationLocales();

  useEffect(() => {
    if (!projectId) return;

    const observable = ideaJsonFormsSchemaStream(projectId).observable;

    const subscription = observable.subscribe((response) => {
      // TODO Remove this dummy API response once back office is set up
      const dummyAPIResponse = {
        json_schema_multiloc: {
          en: {
            type: 'object',
            additionalProperties: true,
            properties: {
              title_multiloc: {
                type: 'object',
                minProperties: 1,
                properties: {
                  en: {
                    type: 'string',
                    minLength: 10,
                    maxLength: 80,
                  },
                },
              },
              body_multiloc: {
                type: 'object',
                minProperties: 1,
                properties: {
                  en: {
                    type: 'string',
                    minLength: 40,
                  },
                },
              },
              custom_fields_multiloc: {
                type: 'object',
                minProperties: 1,
                properties: {
                  en: {
                    type: 'string',
                    minLength: 40,
                  },
                },
              },
            },
            required: ['title_multiloc', 'body_multiloc'],
          },
        },
        ui_schema_multiloc: {
          en: {
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: 'idea',
            },
            elements: [
              {
                type: 'Category',
                label: 'What is your idea ?',
                options: {
                  id: 'mainContent',
                },
                elements: [
                  {
                    type: 'VerticalLayout',
                    options: {
                      render: 'multiloc',
                    },
                    elements: [
                      {
                        type: 'Control',
                        scope: '#/properties/title_multiloc/properties/en',
                        options: {
                          locale: 'en',
                          trim_on_blur: true,
                          description: '',
                        },
                        label: 'Title',
                      },
                    ],
                  },
                  {
                    type: 'VerticalLayout',
                    options: {
                      render: 'multiloc',
                    },
                    elements: [
                      {
                        type: 'Control',
                        locale: 'en',
                        scope: '#/properties/body_multiloc/properties/en',
                        options: {
                          locale: 'en',
                          render: 'WYSIWYG',
                          description: '',
                        },
                        label: 'Description',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'Category',
                label: 'Custom Fields',
                options: {
                  id: 'customfields',
                },
                elements: [
                  {
                    type: 'Control',
                    scope: '#/properties/custom_field',
                    label: 'Custom Field',
                    options: {
                      description: '',
                    },
                  },
                ],
              },
            ],
          },
        },
      };
      setSchema(
        (!isNilOrError(locale) &&
          dummyAPIResponse.json_schema_multiloc[locale]) ||
          (!isNilOrError(locales) &&
            dummyAPIResponse.json_schema_multiloc[locales[0]]) ||
          null
      );
      setUiSchema(
        (!isNilOrError(locale) &&
          dummyAPIResponse.ui_schema_multiloc[locale]) ||
          (!isNilOrError(locales) &&
            dummyAPIResponse.ui_schema_multiloc[locales[0]]) ||
          null
      );

      if (isNilOrError(response)) {
        // setSchema(null);
        // setUiSchema(null);
        // setIsError(true);
      } else {
        setIsError(false);
        setSchema(
          (!isNilOrError(locale) && response.json_schema_multiloc[locale]) ||
            (!isNilOrError(locales) &&
              response.json_schema_multiloc[locales[0]]) ||
            null
        );
        setUiSchema(
          (!isNilOrError(locale) && response.ui_schema_multiloc[locale]) ||
            (!isNilOrError(locales) &&
              response.ui_schema_multiloc[locales[0]]) ||
            null
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [projectId, locale, locales]);

  return { schema, uiSchema, inputSchemaError: isError };
};
