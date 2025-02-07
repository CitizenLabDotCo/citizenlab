import { PageType } from '../typings';

import getFilteredDataForUserPath from './getFilteredDataForUserPath';

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
