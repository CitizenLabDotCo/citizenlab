import {
  getFilteredDataForUserPath,
  isPageCategorization,
  PageType,
  getFormCompletionPercentage,
} from 'components/Form/Components/Layouts/utils';

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
