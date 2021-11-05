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
    type: 'VerticalLayout',
    render: 'multiloc',
    elements: [
      {
        type: 'Control',
        label: 'Title',
        locale: 'en',
        scope: '#/properties/title_multiloc/properties/en',
      },
      {
        type: 'Control',
        label: 'Titel',
        locale: 'nl-BE',
        scope: '#/properties/title_multiloc/properties/nl-BE',
      },
      {
        type: 'Control',
        label: 'Titre',
        locale: 'fr-BE',
        scope: '#/properties/title_multiloc/properties/fr-BE',
      },
    ],
  },
});
