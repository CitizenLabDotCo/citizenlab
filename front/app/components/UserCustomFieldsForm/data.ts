export const data = {
  type: 'schema',
  attributes: {
    json_schema_multiloc: {
      en: {
        type: 'object',
        additionalProperties: false,
        properties: {
          activite_sur_la_ville: {
            type: 'array',
            uniqueItems: true,
            minItems: 0,
            items: {
              type: 'string',
              oneOf: [
                {
                  const: 'resident',
                  title: 'domicile',
                },
                {
                  const: 'travaille_sur_la_commune',
                  title: 'emploi',
                },
                {
                  const: 'activite_associative',
                  title: 'scolarité',
                },
                {
                  const: 'commercant',
                  title: 'associatif',
                },
                {
                  const: 'autre',
                  title: 'autre',
                },
              ],
            },
          },
          adresse: {
            type: 'string',
          },
          gender: {
            type: 'string',
            oneOf: [
              {
                const: 'male',
                title: 'Masculin',
              },
              {
                const: 'female',
                title: 'Féminin',
              },
              {
                const: 'unspecified',
                title: 'Autre',
              },
            ],
          },
          ville: {
            type: 'string',
          },
          code_postal: {
            type: 'number',
          },
          telephone: {
            type: 'string',
          },
          date_de_naissance: {
            type: 'string',
            format: 'date',
          },
          domicile: {
            type: 'string',
            oneOf: [
              {
                const: 'eda8dcab-df9e-4bb4-b16a-b6efb644ea0d',
                title: 'Quartier Valmy',
              },
              {
                const: '4985b063-e2a0-497c-8d6a-b0b5ab76dcd4',
                title: 'Quartier Pasteur',
              },
              {
                const: 'e7f7e7d9-844c-41de-ab45-0fe0a371e298',
                title: 'Quartier Bercy',
              },
              {
                const: '9829dd39-1a7a-4fbf-8fb8-f14818c90bd1',
                title: 'Quartier Centre',
              },
              {
                const: '70cb12d6-ff7f-4a40-b717-f7d2bcb5fc6b',
                title: 'Quartier Pont',
              },
              {
                const: 'outside',
                title: 'Autre lieu',
              },
            ],
          },
        },
        required: [
          'adresse',
          'gender',
          'telephone',
          'date_de_naissance',
          'domicile',
        ],
      },
    },
    ui_schema_multiloc: {
      en: {
        type: 'VerticalLayout',
        options: {
          formId: 'user-form',
        },
        elements: [
          {
            type: 'Control',
            scope: '#/properties/activite_sur_la_ville',
            label: 'Activité(s) sur la ville',
            options: {
              description: '',
              input_type: 'multiselect',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/adresse',
            label: 'Adresse postale',
            options: {
              description: '',
              input_type: 'text',
              transform: 'trim_on_blur',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/gender',
            label: 'Genre',
            options: {
              description: '',
              input_type: 'select',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/ville',
            label: 'Ville',
            options: {
              description: '(si différente de Charenton-le-Pont)',
              input_type: 'text',
              transform: 'trim_on_blur',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/code_postal',
            label: 'Code postal',
            options: {
              description: '(si différent de 94220)',
              input_type: 'number',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/telephone',
            label: 'Téléphone',
            options: {
              description: '',
              input_type: 'text',
              transform: 'trim_on_blur',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/date_de_naissance',
            label: 'Date de naissance',
            options: {
              description: '',
              input_type: 'date',
            },
          },
          {
            type: 'Control',
            scope: '#/properties/domicile',
            label: 'Domicile',
            options: {
              description: '',
              input_type: 'select',
            },
          },
        ],
      },
    },
  },
};
