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
      // TODO Remove this. Temporary fo testing.
      const dummyAPIResponse = {
        json_schema_multiloc: {
          en: {
            type: 'object',
            additionalProperties: false,
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
                  'fr-FR': {
                    type: 'string',
                    minLength: 10,
                    maxLength: 80,
                  },
                  'nl-NL': {
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
                  'fr-FR': {
                    type: 'string',
                    minLength: 40,
                  },
                  'nl-NL': {
                    type: 'string',
                    minLength: 40,
                  },
                },
              },
              proposed_budget: {
                type: 'number',
              },
              topic_ids: {
                type: 'array',
                uniqueItems: true,
                minItems: 0,
                items: {
                  type: 'string',
                },
              },
              location_description: {
                type: 'string',
              },
              idea_images_attributes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    image: {
                      type: 'string',
                    },
                  },
                },
              },
              idea_files_attributes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    file_by_content: {
                      type: 'object',
                      properties: {
                        file: {
                          type: 'string',
                        },
                        name: {
                          type: 'string',
                        },
                      },
                    },
                    name: {
                      type: 'string',
                    },
                  },
                },
              },
            },
            required: ['title_multiloc', 'body_multiloc'],
          },
          'fr-FR': {
            type: 'object',
            additionalProperties: false,
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
                  'fr-FR': {
                    type: 'string',
                    minLength: 10,
                    maxLength: 80,
                  },
                  'nl-NL': {
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
                  'fr-FR': {
                    type: 'string',
                    minLength: 40,
                  },
                  'nl-NL': {
                    type: 'string',
                    minLength: 40,
                  },
                },
              },
              proposed_budget: {
                type: 'number',
              },
              topic_ids: {
                type: 'array',
                uniqueItems: true,
                minItems: 0,
                items: {
                  type: 'string',
                },
              },
              location_description: {
                type: 'string',
              },
              idea_images_attributes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    image: {
                      type: 'string',
                    },
                  },
                },
              },
              idea_files_attributes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    file_by_content: {
                      type: 'object',
                      properties: {
                        file: {
                          type: 'string',
                        },
                        name: {
                          type: 'string',
                        },
                      },
                    },
                    name: {
                      type: 'string',
                    },
                  },
                },
              },
            },
            required: ['title_multiloc', 'body_multiloc'],
          },
          'nl-NL': {
            type: 'object',
            additionalProperties: false,
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
                  'fr-FR': {
                    type: 'string',
                    minLength: 10,
                    maxLength: 80,
                  },
                  'nl-NL': {
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
                  'fr-FR': {
                    type: 'string',
                    minLength: 40,
                  },
                  'nl-NL': {
                    type: 'string',
                    minLength: 40,
                  },
                },
              },
              proposed_budget: {
                type: 'number',
              },
              topic_ids: {
                type: 'array',
                uniqueItems: true,
                minItems: 0,
                items: {
                  type: 'string',
                },
              },
              location_description: {
                type: 'string',
              },
              idea_images_attributes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    image: {
                      type: 'string',
                    },
                  },
                },
              },
              idea_files_attributes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    file_by_content: {
                      type: 'object',
                      properties: {
                        file: {
                          type: 'string',
                        },
                        name: {
                          type: 'string',
                        },
                      },
                    },
                    name: {
                      type: 'string',
                    },
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
                      {
                        type: 'Control',
                        scope: '#/properties/title_multiloc/properties/fr-FR',
                        options: {
                          locale: 'fr-FR',
                          trim_on_blur: true,
                          description: '',
                        },
                        label: 'Titre',
                      },
                      {
                        type: 'Control',
                        scope: '#/properties/title_multiloc/properties/nl-NL',
                        options: {
                          locale: 'nl-NL',
                          trim_on_blur: true,
                          description: '',
                        },
                        label: 'Titel',
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
                      {
                        type: 'Control',
                        locale: 'fr-FR',
                        scope: '#/properties/body_multiloc/properties/fr-FR',
                        options: {
                          locale: 'fr-FR',
                          render: 'WYSIWYG',
                          description: '',
                        },
                        label: 'Description',
                      },
                      {
                        type: 'Control',
                        locale: 'nl-NL',
                        scope: '#/properties/body_multiloc/properties/nl-NL',
                        options: {
                          locale: 'nl-NL',
                          render: 'WYSIWYG',
                          description: '',
                        },
                        label: 'Beschrijving',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'Category',
                options: {
                  id: 'details',
                },
                label: 'Details',
                elements: [
                  {
                    type: 'Control',
                    scope: '#/properties/topic_ids',
                    label: 'Tags',
                    options: {
                      description: '',
                    },
                  },
                  {
                    type: 'Control',
                    scope: '#/properties/location_description',
                    label: 'Location',
                    options: {
                      description: '',
                      transform: 'trim_on_blur',
                    },
                  },
                ],
              },
              {
                type: 'Category',
                label: 'Images and Attachements',
                options: {
                  id: 'attachments',
                },
                elements: [
                  {
                    type: 'Control',
                    scope: '#/properties/idea_images_attributes',
                    label: 'Images',
                    options: {
                      description: '',
                    },
                  },
                  {
                    type: 'Control',
                    scope: '#/properties/idea_files_attributes',
                    label: 'Attachments',
                    options: {
                      description: '',
                    },
                  },
                ],
              },
            ],
          },
          'fr-FR': {
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: 'idea',
            },
            elements: [
              {
                type: 'Category',
                label: 'Quelle est votre idée ?',
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
                      {
                        type: 'Control',
                        scope: '#/properties/title_multiloc/properties/fr-FR',
                        options: {
                          locale: 'fr-FR',
                          trim_on_blur: true,
                          description: '',
                        },
                        label: 'Titre',
                      },
                      {
                        type: 'Control',
                        scope: '#/properties/title_multiloc/properties/nl-NL',
                        options: {
                          locale: 'nl-NL',
                          trim_on_blur: true,
                          description: '',
                        },
                        label: 'Titel',
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
                      {
                        type: 'Control',
                        locale: 'fr-FR',
                        scope: '#/properties/body_multiloc/properties/fr-FR',
                        options: {
                          locale: 'fr-FR',
                          render: 'WYSIWYG',
                          description: '',
                        },
                        label: 'Description',
                      },
                      {
                        type: 'Control',
                        locale: 'nl-NL',
                        scope: '#/properties/body_multiloc/properties/nl-NL',
                        options: {
                          locale: 'nl-NL',
                          render: 'WYSIWYG',
                          description: '',
                        },
                        label: 'Beschrijving',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'Category',
                options: {
                  id: 'details',
                },
                label: 'Détails',
                elements: [
                  {
                    type: 'Control',
                    scope: '#/properties/topic_ids',
                    label: 'Étiquettes',
                    options: {
                      description: '',
                    },
                  },
                  {
                    type: 'Control',
                    scope: '#/properties/location_description',
                    label: 'Adresse',
                    options: {
                      description: '',
                      transform: 'trim_on_blur',
                    },
                  },
                ],
              },
              {
                type: 'Category',
                label: 'Images et pièces jointes',
                options: {
                  id: 'attachments',
                },
                elements: [
                  {
                    type: 'Control',
                    scope: '#/properties/idea_images_attributes',
                    label: 'Images',
                    options: {
                      description: '',
                    },
                  },
                  {
                    type: 'Control',
                    scope: '#/properties/idea_files_attributes',
                    label: 'Pièces jointes',
                    options: {
                      description: '',
                    },
                  },
                ],
              },
            ],
          },
          'nl-NL': {
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: 'idea',
            },
            elements: [
              {
                type: 'Category',
                label: 'Wat is je idee?',
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
                      {
                        type: 'Control',
                        scope: '#/properties/title_multiloc/properties/fr-FR',
                        options: {
                          locale: 'fr-FR',
                          trim_on_blur: true,
                          description: '',
                        },
                        label: 'Titre',
                      },
                      {
                        type: 'Control',
                        scope: '#/properties/title_multiloc/properties/nl-NL',
                        options: {
                          locale: 'nl-NL',
                          trim_on_blur: true,
                          description: '',
                        },
                        label: 'Titel',
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
                      {
                        type: 'Control',
                        locale: 'fr-FR',
                        scope: '#/properties/body_multiloc/properties/fr-FR',
                        options: {
                          locale: 'fr-FR',
                          render: 'WYSIWYG',
                          description: '',
                        },
                        label: 'Description',
                      },
                      {
                        type: 'Control',
                        locale: 'nl-NL',
                        scope: '#/properties/body_multiloc/properties/nl-NL',
                        options: {
                          locale: 'nl-NL',
                          render: 'WYSIWYG',
                          description: '',
                        },
                        label: 'Beschrijving',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'Category',
                options: {
                  id: 'details',
                },
                label: 'Details',
                elements: [
                  {
                    type: 'Control',
                    scope: '#/properties/topic_ids',
                    label: 'Tags',
                    options: {
                      description: '',
                    },
                  },
                  {
                    type: 'Control',
                    scope: '#/properties/location_description',
                    label: 'Locatie',
                    options: {
                      description: '',
                      transform: 'trim_on_blur',
                    },
                  },
                ],
              },
              {
                type: 'Category',
                label: 'Afbeeldingen en bijlagen',
                options: {
                  id: 'attachments',
                },
                elements: [
                  {
                    type: 'Control',
                    scope: '#/properties/idea_images_attributes',
                    label: 'Afbeeldingen',
                    options: {
                      description: '',
                    },
                  },
                  {
                    type: 'Control',
                    scope: '#/properties/idea_files_attributes',
                    label: 'Bijlagen',
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
