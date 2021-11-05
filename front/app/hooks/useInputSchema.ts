export default (_projectId) => ({
  schema: {
    type: 'object',
    properties: {
      title_multiloc: {
        type: 'object',
        description: '#msgTitle',
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
    type: 'VerticalLayout',
    render: 'multiloc',
    elements: [
      {
        type: 'Control',
        scope: '#/properties/title_multiloc/properties/en',
      },
      {
        type: 'Control',
        scope: '#/properties/title_multiloc/properties/nl-BE',
      },
      {
        type: 'Control',
        scope: '#/properties/title_multiloc/properties/fr-BE',
      },
    ],
  },
});
