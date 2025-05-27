import isPageCategorization from './isPageCategorization';

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
    const isPage = isPageCategorization(uiSchema, jsonSchema, {
      rootSchema: jsonSchema,
      config: {},
    });
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
    const isPage = isPageCategorization(uiSchema, jsonSchema, {
      rootSchema: jsonSchema,
      config: {},
    });
    expect(isPage).toEqual(false);
  });
});
