export default (_projectId) => ({
  schema: {
    type: 'object',
    properties: {
      title_multiloc: {
        type: 'object',
        minLength: 3,
        properties: {
          en: {
            type: 'string',
          },
          'nl-BE': {
            type: 'string',
          },
          'fr-BE': {
            type: 'string',
          },
        },
      },
    },
  },
  uiSchema: {
    type: 'Categorization',
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
        ],
      },
    ],
  },
});
