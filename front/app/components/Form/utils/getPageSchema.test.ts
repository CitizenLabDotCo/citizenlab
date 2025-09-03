import getPageSchema from './getPageSchema';

describe('getPageSchema', () => {
  it('returns only the schema values (required and properties) that pertain to the pageCategorization passed in', () => {
    const pageCategorization = {
      type: 'Page',
      options: {
        input_type: 'page',
        id: 'd99d4aaf-0b15-4b49-b9dc-58be06c6656c',
        title: '',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [
        {
          type: 'Control',
          scope: '#/properties/your_question_cf8',
          label: 'Your question',
          options: {
            description: '',
            input_type: 'select',
            isAdminField: false,
            hasRule: true,
            dropdown_layout: false,
            enumNames: ['Option 1', 'Option 2'],
          },
        },
      ],
    };

    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        your_question_cf8: {
          type: 'string',
          enum: ['option_1_og1', 'option_2_r7u'],
        },
        another_single_choice_nfi: {
          type: 'string',
          enum: ['option_1_ypt', 'option_2_cfu'],
        },
      },
    };

    const outputSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        your_question_cf8: {
          type: 'string',
          enum: ['option_1_og1', 'option_2_r7u'],
        },
      },
      required: [],
    };

    expect(getPageSchema(schema, pageCategorization as any, {})).toEqual(
      outputSchema
    );
  });

  it('should return the page schema from a schema with many pages', () => {
    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        short_answer: {
          type: 'string',
        },
        multiple_choice: {
          type: 'string',
          oneOf: [
            {
              const: 'oranges',
              title: 'Oranges',
            },
            {
              const: 'mangoes',
              title: 'Mangoes',
            },
            {
              const: 'pineapples',
              title: 'Pineapples',
            },
          ],
        },
        areas: {
          type: 'string',
          oneOf: [
            {
              const: 'kyanja',
              title: 'Kyanja',
            },
            {
              const: 'naalya',
              title: 'Naalya',
            },
            {
              const: 'bugoloobi',
              title: 'Bugoloobi',
            },
          ],
        },
        number: {
          type: 'number',
        },
        location_description: {
          type: 'string',
        },
        sport: {
          type: 'string',
          oneOf: [
            {
              const: 'soccer',
              title: 'Soccer',
            },
            {
              const: 'basketball',
              title: 'Basket ball',
            },
            {
              const: 'netball',
              title: 'Netball',
            },
          ],
        },
      },
      required: ['short_answer', 'multiple_choice', 'areas', 'number'],
    };

    const pageCategorization = {
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
            description: 'my description',
            title: 'my title',
          },
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
          scope: '#/properties/number',
          label: 'Number',
          options: {
            description: '',
            isAdminField: false,
          },
        },
      ],
    };

    const expectedPageSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        short_answer: {
          type: 'string',
        },
        multiple_choice: {
          type: 'string',
          oneOf: [
            {
              const: 'oranges',
              title: 'Oranges',
            },
            {
              const: 'mangoes',
              title: 'Mangoes',
            },
            {
              const: 'pineapples',
              title: 'Pineapples',
            },
          ],
        },
        areas: {
          type: 'string',
          oneOf: [
            {
              const: 'kyanja',
              title: 'Kyanja',
            },
            {
              const: 'naalya',
              title: 'Naalya',
            },
            {
              const: 'bugoloobi',
              title: 'Bugoloobi',
            },
          ],
        },
        number: {
          type: 'number',
        },
      },
      required: ['short_answer', 'multiple_choice', 'areas', 'number'],
    };

    const pageSchema = getPageSchema(schema, pageCategorization as any, {});
    expect(pageSchema).toEqual(expectedPageSchema);
  });
});
