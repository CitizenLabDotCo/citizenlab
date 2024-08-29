import { RuleEffect } from '@jsonforms/core';

import {
  getFilteredDataForUserPath,
  getPageSchema,
  isPageCategorization,
  PageType,
  getFormCompletionPercentage,
} from 'components/Form/Components/Layouts/utils';
import { customAjv } from 'components/Form/utils';

describe('getPageSchema', () => {
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

    const pageCategorization: PageType = {
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

    const pageSchema = getPageSchema(
      schema,
      pageCategorization,
      data,
      customAjv
    );
    expect(pageSchema).toEqual(expectedPageSchema);
  });

  it('should remove hidden fields that are required from the required key of the page ', () => {
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

    const pageCategorization: PageType = {
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

    const expectedPageSchema = {
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

    const pageSchema = getPageSchema(
      schema,
      pageCategorization,
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

describe('getFilteredDataForUserPath', () => {
  it('should return data only present in the user page path', () => {
    const pageCategorization: PageType[] = [
      {
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
        ],
      },
      {
        type: 'Page',
        label: 'Testlabel',
        options: {
          id: 'extra',
        },
        elements: [
          {
            type: 'Control',
            scope: '#/properties/multiple_choice_1',
            label: 'Fruits',
            options: {
              description: '',
              isAdminField: false,
            },
          },
        ],
      },
    ];

    let filteredData = getFilteredDataForUserPath(pageCategorization, {
      multiple_choice: 'value',
    });
    expect(filteredData).toEqual({ data: { multiple_choice: 'value' } });
    filteredData = getFilteredDataForUserPath(pageCategorization, {
      multiple_choice_1: 'value',
    });
    expect(filteredData).toEqual({ data: { multiple_choice_1: 'value' } });
    filteredData = getFilteredDataForUserPath(pageCategorization, {
      multiple_choice_2: 'value',
    });
    expect(filteredData).toEqual({ data: {} });
  });
});

describe('getFormCompletionPercentage', () => {
  it('returns 0 when no fields are filled in and user is on first page', () => {
    const schema = {
      properties: {
        field1: { type: 'string' },
        field2: { type: 'string' },
        field3: { type: 'string' },
      },
      required: ['field1', 'field2'],
    };

    const pages = [
      { elements: [{ scope: '#/properties/field1' }] },
      { elements: [{ scope: '#/properties/field2' }] },
      { elements: [{ scope: '#/properties/field3' }] },
    ] as PageType[];

    const data = {};

    const currentPageIndex = 0;

    const percentage = getFormCompletionPercentage(
      schema,
      pages,
      data,
      currentPageIndex
    );

    expect(percentage).toBe(0);
  });

  it('returns 100 when all required fields are filled in and there are unfilled optional fields are on previous pages', () => {
    const schema = {
      properties: {
        field1: { type: 'string' },
        field2: { type: 'string' },
        field3: { type: 'string' },
      },
      required: ['field2', 'field3'],
    };

    const pages = [
      { elements: [{ scope: '#/properties/field1' }] },
      { elements: [{ scope: '#/properties/field2' }] },
      { elements: [{ scope: '#/properties/field3' }] },
    ] as PageType[];

    const data = {
      field2: 'value2',
      field3: 'value3',
    };

    const currentPageIndex = 2;

    const percentage = getFormCompletionPercentage(
      schema,
      pages,
      data,
      currentPageIndex
    );

    expect(percentage).toBe(100);
  });

  it('returns correct percentage when some required fields are filled in', () => {
    const schema = {
      properties: {
        field1: { type: 'string' },
        field2: { type: 'string' },
        field3: { type: 'string' },
      },
      required: ['field1', 'field2'],
    };

    const pages = [
      { elements: [{ scope: '#/properties/field1' }] },
      { elements: [{ scope: '#/properties/field2' }] },
      { elements: [{ scope: '#/properties/field3' }] },
    ] as PageType[];

    const data = {
      field1: 'value1',
    };

    const currentPageIndex = 0;

    const percentage = getFormCompletionPercentage(
      schema,
      pages,
      data,
      currentPageIndex
    );

    expect(percentage).toBe(33.33333333333333);
  });

  it('returns 0 when no optional fields are filled in and user is on first page', () => {
    const schema = {
      properties: {
        field1: { type: 'string' },
        field2: { type: 'string' },
        field3: { type: 'string' },
      },
      required: [],
    };

    const pages = [
      { elements: [{ scope: '#/properties/field1' }] },
      { elements: [{ scope: '#/properties/field2' }] },
      { elements: [{ scope: '#/properties/field3' }] },
    ] as PageType[];

    const data = {};

    const currentPageIndex = 0;

    const percentage = getFormCompletionPercentage(
      schema,
      pages,
      data,
      currentPageIndex
    );

    expect(percentage).toBe(0);
  });

  it('returns 100 when all optional fields are filled in', () => {
    const schema = {
      properties: {
        field1: { type: 'string' },
        field2: { type: 'string' },
        field3: { type: 'string' },
      },
      required: [],
    };

    const pages = [
      { elements: [{ scope: '#/properties/field1' }] },
      { elements: [{ scope: '#/properties/field2' }] },
      { elements: [{ scope: '#/properties/field3' }] },
    ] as PageType[];

    const data = {
      field1: 'value1',
      field2: 'value2',
      field3: 'value3',
    };

    const currentPageIndex = 0;

    const percentage = getFormCompletionPercentage(
      schema,
      pages,
      data,
      currentPageIndex
    );

    expect(percentage).toBe(100);
  });
});
