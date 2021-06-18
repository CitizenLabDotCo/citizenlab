import React from 'react';
import { render, screen, fireEvent, within, act } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsInputs';
import * as hook from 'modules/commercial/insights/hooks/useInsightsInputs';
import * as batchService from 'modules/commercial/insights/services/batchAssignment';
import clHistory from 'utils/cl-router/history';

jest.mock('modules/commercial/insights/services/insightsInputs', () => ({
  deleteInsightsInputCategory: jest.fn(),
}));
jest.mock('modules/commercial/insights/services/batchAssignment', () => ({
  batchAssignCategories: jest.fn(),
  batchUnassignCategories: jest.fn(),
}));

import InputsTable from './';

const viewId = '1';

let mockInputData = {
  currentPage: 1,
  lastPage: 2,
  list: [
    {
      id: '4e9ac1f1-6928-45e9-9ac9-313e86ad636f',
      type: 'input',
      relationships: {
        source: {
          data: {
            id: '4e9ac1f1-6928-45e9-9ac9-313e86ad636f',
            type: 'idea',
          },
        },
        categories: {
          data: [
            {
              id: '94a649b5-23fe-4d47-9165-9beceef2dcad',
              type: 'category',
            },
            {
              id: '94a649b5-23fe-4d47-9165-9becedfg45sd',
              type: 'category',
            },
          ],
        },
        suggested_categories: {
          data: [],
        },
      },
    },
    {
      id: '54438f73-12f4-4b16-84f3-a55bd118de7e',
      type: 'input',
      relationships: {
        source: {
          data: {
            id: '54438f73-12f4-4b16-84f3-a55bd118de7e',
            type: 'idea',
          },
        },
        categories: {
          data: [],
        },
        suggested_categories: {
          data: [],
        },
      },
    },
  ],
};

const mockIdeaData = {
  id: '2',
  type: 'idea',
  attributes: {
    title_multiloc: { en: 'Test Idea' },
  },
};

const mockCategoryData = {
  id: '3612e489-a631-4e7d-8bdb-63be407ea123',
  type: 'category',
  attributes: {
    name: 'Category 1',
  },
};
const mockCategoriesData = [
  {
    id: '3612e489-a631-4e7d-8bdb-63be407ea123',
    type: 'category',
    attributes: {
      name: 'Category 1',
    },
  },
  {
    id: '26739409-a631-4e7d-8bdb-676308464923',
    type: 'category',
    attributes: {
      name: 'Category 2',
    },
  },
];

let mockLocationData = { pathname: '', query: {} };

jest.mock('hooks/useIdea', () => {
  return jest.fn(() => mockIdeaData);
});

jest.mock('modules/commercial/insights/hooks/useInsightsCategory', () => {
  return jest.fn(() => mockCategoryData);
});

jest.mock('modules/commercial/insights/hooks/useInsightsCategories', () => {
  return jest.fn(() => mockCategoriesData);
});

jest.mock('modules/commercial/insights/hooks/useInsightsInputs', () => {
  return jest.fn(() => mockInputData);
});

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

jest.mock('utils/cl-intl');

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return (
          <Component
            {...props}
            params={{ viewId }}
            location={mockLocationData}
          />
        );
      };
    },
  };
});

jest.mock('utils/cl-router/history');

window.confirm = jest.fn(() => true);

describe('Insights Input Table', () => {
  it('renders', () => {
    render(<InputsTable />);
    expect(screen.getByTestId('insightsInputsTable')).toBeInTheDocument();
  });

  describe('Rows general display and function', () => {
    it('renders correct number of rows', () => {
      render(<InputsTable />);
      expect(screen.getAllByTestId('insightsInputsTableRow')).toHaveLength(2);
    });
    it('renders list of categories correctly', () => {
      render(<InputsTable />);
      const firstRow = screen.getAllByTestId('insightsInputsTableRow')[0];
      const secondRow = screen.getAllByTestId('insightsInputsTableRow')[1];
      expect(within(firstRow).getAllByTestId('insightsTag')).toHaveLength(2);
      expect(within(secondRow).queryAllByTestId('insightsTag')).toHaveLength(0);
    });
    it('calls onDelete category with correct arguments', () => {
      const spy = jest.spyOn(service, 'deleteInsightsInputCategory');
      render(<InputsTable />);
      const firstTagDeleteIcon = screen
        .getAllByTestId('insightsTag')[0]
        .querySelector('.insightsTagCloseIcon');
      if (firstTagDeleteIcon) {
        fireEvent.click(firstTagDeleteIcon);
      }

      expect(spy).toHaveBeenCalledWith(
        viewId,
        mockInputData.list[0].id,
        mockInputData.list[0].relationships.categories.data[0].id
      );
    });
  });

  describe('Rows selection and actions', () => {
    describe('when no inputs selected', () => {
      describe('Selection', () => {
        it('has a top-level checkbox to select all inputs in the page', () => {
          mockLocationData = {
            pathname: '',
            query: { category: mockCategoriesData[0].id },
          };
          mockInputData = { ...mockInputData, currentPage: 1, lastPage: 1 };

          render(<InputsTable />);
          // Initially all rows are unchecked
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([false, false]);

          expect(
            screen.getAllByRole('checkbox', { checked: false })
          ).toHaveLength(3);

          fireEvent.click(screen.getByTestId('headerCheckBox'));

          // not sure this works as I want
          expect(
            screen.getAllByRole('checkbox', { checked: true })
          ).toHaveLength(3);
          // so keeping this
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([true, true]);
        });
        it('has a functional checkbox in each row', () => {
          mockLocationData = { pathname: '', query: { category: undefined } };
          mockInputData = { ...mockInputData, currentPage: 1, lastPage: 1 };

          render(<InputsTable />);
          // Initially all rows are unchecked
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([false, false]);
          fireEvent.click(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))[0]
          );
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([true, false]);
          fireEvent.click(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))[0]
          );
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([false, false]);
        });
      });
    });
    describe('when some inputs selected in a category', () => {
      beforeEach(() => {
        mockLocationData = {
          pathname: '',
          query: { category: mockCategoriesData[0].id },
        };
        mockInputData = { ...mockInputData, currentPage: 1, lastPage: 1 };
        render(<InputsTable />);
        fireEvent.click(
          screen
            .getAllByTestId('insightsInputsTableRow')
            .map((row) => within(row).getByRole('checkbox'))[0]
        );
      });
      describe('Selection', () => {
        it('has a top-level checkbox to unselect all inputs in the page', () => {
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([true, false]);
          expect(
            screen.getAllByRole('checkbox', { checked: false })
          ).toHaveLength(1);
          expect(
            screen.getAllByRole('checkbox', { checked: true })
          ).toHaveLength(1);

          fireEvent.click(screen.getByTestId('headerCheckBox'));
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([false, false]);
          expect(
            screen.getAllByRole('checkbox', { checked: false })
          ).toHaveLength(3);
        });
      });
      describe('Actions', () => {
        it('has an assign button that works as expected', () => {
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([true, false]);

          act(() => {
            fireEvent.click(
              screen.getByText('Add categories to selected inputs')
            );
          });
          act(() => {
            fireEvent.click(
              within(screen.getByTestId('insightsTableActions')).getByText(
                mockCategoriesData[1].attributes.name
              )
            );
          });
          expect(
            within(screen.getByTestId('insightsTableActions')).queryAllByText(
              mockCategoriesData[0].attributes.name
            )
          ).toHaveLength(0);
          act(() => {
            fireEvent.click(screen.getByText('Add'));
          });

          expect(batchService.batchAssignCategories).toHaveBeenCalledWith(
            '1',
            [mockInputData.list[0].id],
            [mockCategoriesData[1].id]
          );
        });
        it('has an unassign button that works as expected', () => {
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([true, false]);

          act(() => {
            fireEvent.click(screen.getByText('Remove'));
          });

          expect(window.confirm).toHaveBeenCalledTimes(1);
          expect(batchService.batchUnassignCategories).toHaveBeenCalledWith(
            '1',
            [mockInputData.list[0].id],
            [mockCategoriesData[0].id]
          );
        });
      });
    });
  });

  describe('Pagination', () => {
    it("doesn't show pagination when there's only one page", () => {
      mockInputData = { ...mockInputData, currentPage: 1, lastPage: 1 };
      render(<InputsTable />);
      expect(screen.queryByTestId('pagination')).toBeNull();
    });
    it('shows pagination when there are multiple pages', () => {
      mockInputData = { ...mockInputData, currentPage: 1, lastPage: 2 };
      render(<InputsTable />);
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
    it('clicks on pagination navigate to the right page', () => {
      mockLocationData = {
        query: { category: 'category' },
        pathname: 'editViewPagePath',
      };
      mockInputData = { ...mockInputData, currentPage: 1, lastPage: 2 };
      const spy = jest.spyOn(clHistory, 'push');
      render(<InputsTable />);
      fireEvent.click(within(screen.getByTestId('pagination')).getByText('2'));
      expect(spy).toHaveBeenCalledWith({
        pathname: 'editViewPagePath',
        search: '?category=category&pageNumber=2',
      });
    });
    it('loads the page passed in url params', () => {
      mockLocationData = {
        ...mockLocationData,
        pathname: 'editViewPagePath',
        query: { pageNumber: 2 },
      };
      const spy = jest.spyOn(hook, 'default');
      render(<InputsTable />);
      expect(spy).toHaveBeenCalledWith(viewId, {
        pageNumber: 2,
      });
    });
  });

  describe('Empty States', () => {
    it('renders table empty state when there are no inputs', () => {
      mockInputData = { currentPage: 1, lastPage: 1, list: [] };
      render(<InputsTable />);
      expect(
        screen.getByTestId('insightsInputsTableEmptyState')
      ).toBeInTheDocument();
      expect(
        screen.getByText("This project doesn't seem to contain any input.")
      ).toBeInTheDocument();
    });
    it('renders correct table empty state when are no input for category', () => {
      mockLocationData = {
        pathname: '',
        query: { category: mockCategoriesData[0].id },
      };
      mockInputData = { currentPage: 1, lastPage: 1, list: [] };

      render(<InputsTable />);
      expect(
        screen.getByTestId('insightsInputsTableEmptyState')
      ).toBeInTheDocument();
      expect(
        screen.getByText('You have no input assigned to this category yet')
      ).toBeInTheDocument();
    });
  });
});
