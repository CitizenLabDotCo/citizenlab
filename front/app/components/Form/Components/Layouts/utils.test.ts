import Ajv from 'ajv';
import {
  getPageSchema,
  PageCategorization,
  isPageCategorization,
} from 'components/Form/Components/Layouts/utils';

const customAjv = new Ajv({ useDefaults: 'empty', removeAdditional: true });

describe('getPageSchema', () => {
  it('should return the page schema from a schema with many pages', () => {
    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        short_answer: {
          type: 'string',
        },
        boolean: {
          type: 'boolean',
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
        linear_scale: {
          type: 'number',
          minimum: 1,
          maximum: 5,
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
      required: [
        'short_answer',
        'multiple_choice',
        'areas',
        'linear_scale',
        'number',
      ],
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
    };

    const data = {
      short_answer: 'fgfgfg',
      multiple_choice: 'pineapples',
      areas: 'kyanja',
      linear_scale: 3,
      number: 45,
    };

    const expectedPageSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        short_answer: {
          type: 'string',
        },
        boolean: {
          type: 'boolean',
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
        linear_scale: {
          type: 'number',
          minimum: 1,
          maximum: 5,
        },
        number: {
          type: 'number',
        },
      },
      required: [
        'short_answer',
        'multiple_choice',
        'areas',
        'linear_scale',
        'number',
      ],
    };

    const pageSchema = getPageSchema(
      schema,
      pageCategorization as any as PageCategorization,
      data,
      customAjv
    );
    expect(pageSchema).toEqual(expectedPageSchema);
  });
});

describe('isPageCategorization', () => {
  it('should return true if the categorization is a page', () => {
    const uiSchema = {
      type: 'Categorization',
      label: 'Testlabel',
      options: {
        id: 'extra',
      },
      elements: [
        {
          type: 'Page',
          label: 'Testlabel',
          options: {
            id: 'extra',
          },
          elements: [],
        },
      ],
    };

    const jsonSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {},
      required: ['short_answer'],
    };
    const isPage = isPageCategorization(uiSchema, jsonSchema);
    expect(isPage).toEqual(true);
  });

  it('should return false when the structure has no page in it', () => {
    const uiSchema = {
      type: 'Categorization',
      label: 'Testlabel',
      options: {
        id: 'extra',
      },
      elements: [
        {
          type: 'Control',
          label: 'Testlabel',
          options: {
            id: 'extra',
          },
          elements: [],
        },
      ],
    };

    const jsonSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {},
      required: ['short_answer'],
    };
    const isPage = isPageCategorization(uiSchema, jsonSchema);
    expect(isPage).toEqual(false);
  });
});
