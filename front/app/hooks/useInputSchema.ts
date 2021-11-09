export default (_projectId) => ({
  schema: {
    type: 'object',
    properties: {
      title_multiloc: {
        type: 'object',
        minProperties: 1,
        properties: {
          en: {
            minLength: 10,
            maxLength: 80,
            type: 'string',
          },
          'nl-BE': {
            minLength: 10,
            maxLength: 80,
            type: 'string',
          },
          'fr-BE': {
            minLength: 10,
            maxLength: 80,
            type: 'string',
          },
        },
      },
      body_multiloc: {
        type: 'object',
        minLength: 3,
        minProperties: 1,
        properties: {
          en: {
            minLength: 40,
            // TODO custom validation sanitizes html before counting
            type: 'string',
          },
          'nl-BE': {
            minLength: 40,
            type: 'string',
          },
          'fr-BE': {
            minLength: 40,
            type: 'string',
          },
        },
      },
      topics: {
        type: 'array',
        items: {
          oneOf: [
            { value: 'uuid', label: 'Nature and Animals' },
            { value: 'uuid', label: 'Safety' },
            { value: 'uuid', label: 'Housing' },
          ],
        },
      },
    },
    required: ['title_multiloc', 'body_multiloc'],
  },
  uiSchema: {
    type: 'Categorization',
    options: {
      submit: 'ButtonBar',
      formId: 'ideaForm',
    },
    elements: [
      {
        type: 'Category',
        label: "What's your idea ?",
        elements: [
          {
            type: 'VerticalLayout',
            render: 'multiloc',
            label: 'Title',
            elements: [
              {
                type: 'Control',
                locale: 'en',
                scope: '#/properties/title_multiloc/properties/en',
              },
              {
                type: 'Control',
                locale: 'nl-BE',
                scope: '#/properties/title_multiloc/properties/nl-BE',
              },
              {
                type: 'Control',
                locale: 'fr-BE',
                scope: '#/properties/title_multiloc/properties/fr-BE',
              },
            ],
          },
          {
            type: 'VerticalLayout',
            render: 'multiloc',
            label: 'Description',
            elements: [
              {
                type: 'Control',
                render: 'WYSIWYG',
                locale: 'en',
                scope: '#/properties/body_multiloc/properties/en',
              },
              {
                type: 'Control',
                render: 'WYSIWYG',
                locale: 'nl-BE',
                scope: '#/properties/body_multiloc/properties/nl-BE',
              },
              {
                type: 'Control',
                render: 'WYSIWYG',
                locale: 'fr-BE',
                scope: '#/properties/body_multiloc/properties/fr-BE',
              },
            ],
          },
          {
            type: 'Control',
            scope: '#/properties/topics',
          },
        ],
      },
    ],
  },
});
