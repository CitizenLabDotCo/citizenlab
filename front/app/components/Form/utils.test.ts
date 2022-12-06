import { getFormSchemaAndData } from './utils';
import Ajv from 'ajv';

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

    const ajv = new Ajv();
    const [resultSchema, resultData] = getFormSchemaAndData(
      schema,
      uiSchema,
      data,
      ajv
    );

    expect(resultSchema).toEqual(schema);
    expect(resultData).toEqual(data);
  });
});
