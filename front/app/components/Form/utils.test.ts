import { getFormSchemaAndData } from './utils';
import { RuleEffect } from '@jsonforms/core';
import { customAjv } from '.';

describe('getFormSchemaAndData', () => {
  it('should return the same schema and data if no elements are hidden', () => {
    const schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        age: {
          type: 'number',
        },
      },
      required: [],
    };

    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name',
        },
        {
          type: 'Control',
          scope: '#/properties/age',
        },
      ],
    };

    const data = {
      name: 'John',
      age: 30,
    };

    const [resultSchema, resultData] = getFormSchemaAndData(
      schema,
      uiSchema,
      data,
      customAjv
    );

    expect(resultSchema).toEqual(schema);
    expect(resultData).toEqual(data);
  });

  it('should remove the data key from the data returned if field is hidden', () => {
    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        multiple_choice: {
          type: 'string',
          oneOf: [
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
        number: {
          type: 'number',
        },
      },
      required: ['multiple_choice', 'number'],
    };

    const uiSchema = {
      type: 'Page',
      label: 'Testlabel',
      options: {
        id: 'extra',
      },
      elements: [
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
          scope: '#/properties/number',
          label: 'Number',
          options: {
            description: '',
            isAdminField: false,
          },
          ruleArray: [
            {
              effect: RuleEffect.SHOW,
              condition: {
                scope: '#/properties/multiple_choice',
                schema: {
                  enum: ['pineapples'],
                },
              },
            },
          ],
        },
      ],
    };

    const data = {
      multiple_choice: 'mangoes',
      number: 45,
    };

    const expectedSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        multiple_choice: {
          type: 'string',
          oneOf: [
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
        number: {
          type: 'number',
        },
      },
      required: ['multiple_choice'],
    };

    const expectedData = {
      multiple_choice: 'mangoes',
    };

    const [resultSchema, resultData] = getFormSchemaAndData(
      schema,
      uiSchema,
      data,
      customAjv
    );

    expect(resultSchema).toEqual(expectedSchema);
    expect(resultData).toEqual(expectedData);
  });
});
