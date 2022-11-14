export const uiSchema = {
  type: 'Categorization',
  label: 'First section',
  options: {
    formId: 'idea-form',
    inputTerm: 'idea',
  },
  elements: [
    {
      type: 'Page',
      label: 'Testlabel',
      options: {
        id: 'extra',
      },
      elements: [
        {
          type: 'Control',
          scope: '#/properties/short_answer',
          label: 'Short answer',
          options: {
            description: '',
            isAdminField: false,
            transform: 'trim_on_blur',
          },
        },
        {
          type: 'Control',
          scope: '#/properties/boolean',
        },
        {
          type: 'Control',
          scope: '#/properties/multiple_choice',
          label: 'Fruits',
          options: {
            description: '',
            isAdminField: false,
          },
        },
        {
          type: 'Control',
          scope: '#/properties/areas',
          label: 'Areas',
          options: {
            description: '',
            isAdminField: false,
          },
        },
        {
          type: 'Control',
          scope: '#/properties/favorite_color',
          label: 'Favorite color',
          options: {
            description: '',
            isAdminField: false,
          },
          rule: {
            effect: 'SHOW',
            condition: {
              scope: '#/properties/multiple_choice',
              schema: {
                enum: ['pineapplesl'],
              },
            },
          },
          ruleArray: [
            {
              effect: 'SHOW',
              condition: {
                scope: '#/properties/multiple_choice',
                schema: {
                  enum: ['pineapples'],
                },
              },
            },
            {
              effect: 'SHOW',
              condition: {
                scope: '#/properties/areas',
                schema: {
                  enum: ['kyanja'],
                },
              },
            },
          ],
        },
        {
          type: 'Control',
          scope: '#/properties/linear_scale',
          label: 'Linear scale',
          options: {
            description: '',
            isAdminField: false,
            minimum_label: '',
            maximum_label: '',
          },
        },
        {
          type: 'Control',
          scope: '#/properties/number',
          label: 'Number',
          options: {
            description: '',
            isAdminField: false,
          },
        },
      ],
    },
    {
      type: 'Page',
      label: 'Details',
      options: {
        id: 'details',
      },
      elements: [
        {
          type: 'Control',
          scope: '#/properties/location_description',
          label: 'Location',
          options: {
            description: '',
            isAdminField: false,
            transform: 'trim_on_blur',
          },
        },
      ],
      ruleArray: [
        {
          effect: 'SHOW',
          condition: {
            scope: '#/properties/multiple_choice',
            schema: {
              enum: ['pineapples'],
            },
          },
        },
        {
          effect: 'SHOW',
          condition: {
            scope: '#/properties/areas',
            schema: {
              enum: ['kyanja'],
            },
          },
        },
      ],
    },
    {
      type: 'Page',
      label: 'Final Page',
      options: {
        id: 'final_page',
      },
      elements: [
        {
          type: 'Control',
          scope: '#/properties/sport',
          label: 'Favorite sport',
          options: {
            description: '',
            isAdminField: false,
          },
        },
      ],
    },
  ],
};
