import React from 'react';
import {
  render,
  screen,
  fireEvent,
  within,
  act,
  waitFor,
} from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsInputs';
import useInsightsInputs from 'modules/commercial/insights/hooks/useInsightsInputs';
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
  id: '94a649b5-23fe-4d47-9165-9beceef2dcad',
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
    Link: () => 'Link',
  };
});

jest.mock('utils/cl-router/history');

jest.mock('modules/commercial/insights/hooks/useInsightsInput', () => {
  return jest.fn(() => undefined);
});

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
    it('adds previewedInputId to url correctly on row click', () => {
      render(<InputsTable />);
      fireEvent.click(screen.getAllByTestId('insightsInputsTableRow')[0]);
      expect(clHistory.replace).toHaveBeenCalledWith({
        pathname: '',
        search: `?previewedInputId=${mockInputData.list[0].id}`,
      });
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
    describe('Additional Column', () => {
      it('renders additional table column when category is selected', () => {
        mockLocationData = { pathname: '', query: { category: 'Category 1' } };

        render(<InputsTable />);
        expect(screen.getAllByRole('columnheader')).toHaveLength(4);
        expect(screen.getByText('Also in')).toBeInTheDocument();
      });
      it('does not render additional table column when category is not selected', () => {
        mockLocationData = { pathname: '', query: { category: '' } };

        render(<InputsTable />);

        expect(screen.getAllByRole('columnheader')).toHaveLength(3);
        expect(screen.queryByText('Also in')).not.toBeInTheDocument();
      });
    });
  });

  describe('Rows selection and actions', () => {
    describe('when no inputs selected', () => {
      describe('Selection', () => {
        it('has a top-level checkbox to select all inputs in the page', async () => {
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

          await act(async () => {
            fireEvent.click(screen.getByTestId('headerCheckBox'));
          });

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
        it('has a functional checkbox in each row', async () => {
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
          await act(async () => {
            fireEvent.click(
              screen
                .getAllByTestId('insightsInputsTableRow')
                .map((row) => within(row).getByRole('checkbox'))[0]
            );
          });
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([true, false]);
          await act(async () => {
            fireEvent.click(
              screen
                .getAllByTestId('insightsInputsTableRow')
                .map((row) => within(row).getByRole('checkbox'))[0]
            );
          });
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
      beforeEach(async () => {
        mockLocationData = {
          pathname: '',
          query: { category: mockCategoriesData[0].id },
        };
        mockInputData = { ...mockInputData, currentPage: 1, lastPage: 1 };
        render(<InputsTable />);
        await act(async () => {
          fireEvent.click(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))[0]
          );
        });
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
        it('has an assign button that works as expected', async () => {
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([true, false]);

          await act(async () => {
            fireEvent.click(
              screen.getByText('Add categories to selected inputs')
            );
          });
          await act(async () => {
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
          await act(async () => {
            fireEvent.click(screen.getByText('Add'));
          });

          expect(batchService.batchAssignCategories).toHaveBeenCalledWith(
            '1',
            [mockInputData.list[0].id],
            [mockCategoriesData[1].id]
          );
        });
        it('has an unassign button that works as expected', async () => {
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([true, false]);

          await act(async () => {
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
        query: {},
        pathname: 'editViewPagePath',
      };
      mockInputData = { ...mockInputData, currentPage: 1, lastPage: 2 };
      const spy = jest.spyOn(clHistory, 'push');
      render(<InputsTable />);
      fireEvent.click(within(screen.getByTestId('pagination')).getByText('2'));
      expect(spy).toHaveBeenCalledWith({
        pathname: 'editViewPagePath',
        search: '?pageNumber=2',
      });
    });
    it('loads the page passed in url params', () => {
      mockLocationData = {
        ...mockLocationData,
        pathname: 'editViewPagePath',
        query: { pageNumber: 2 },
      };

      render(<InputsTable />);
      expect(useInsightsInputs).toHaveBeenCalledWith(viewId, {
        category: undefined,
        pageNumber: 2,
        processed: true,
        search: undefined,
      });
    });
  });

  describe('Sorting', () => {
    it('sorts categories for -approval when category is selected', () => {
      const spy = jest.spyOn(clHistory, 'push');
      mockLocationData = {
        pathname: '',
        query: {
          category: mockInputData.list[0].relationships.categories.data[0].id,
        },
      };

      render(<InputsTable />);
      fireEvent.click(screen.getByTestId('insightsSortButton'));
      expect(spy).toHaveBeenCalledWith({
        pathname: '',
        search: '?category=94a649b5-23fe-4d47-9165-9beceef2dcad&sort=-approval',
      });
    });
    it('sorts categories for approval when category is selected and inputs sorted by -approval', () => {
      const spy = jest.spyOn(clHistory, 'push');
      mockLocationData = {
        pathname: '',
        query: {
          category: mockInputData.list[0].relationships.categories.data[0].id,
          sort: '-approval',
        },
      };

      render(<InputsTable />);
      fireEvent.click(screen.getByTestId('insightsSortButton'));
      expect(spy).toHaveBeenCalledWith({
        pathname: '',
        search: '?category=94a649b5-23fe-4d47-9165-9beceef2dcad&sort=approval',
      });
    });
    it('sort categories button does not render when category is not selected', () => {
      mockLocationData = {
        pathname: '',
        query: { category: '' },
      };

      render(<InputsTable />);
      expect(
        screen.queryByTestId('insightsSortButton')
      ).not.toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('filters table by category', () => {
      mockLocationData = {
        pathname: '',
        query: { category: 'category', pageNumber: 1 },
      };

      render(<InputsTable />);
      expect(useInsightsInputs).toHaveBeenCalledWith(viewId, {
        category: 'category',
        processed: true,
        search: undefined,
        pageNumber: 1,
      });
    });

    it('filters table by Recently posted', () => {
      mockLocationData = {
        pathname: '',
        query: { processed: 'false', pageNumber: 1 },
      };
      mockInputData;
      render(<InputsTable />);
      expect(useInsightsInputs).toHaveBeenCalledWith(viewId, {
        category: undefined,
        processed: false,
        search: undefined,
        pageNumber: 1,
      });
      expect(
        screen.getByTestId('insightsRecentlyAddedInfobox')
      ).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('filters table by search query', () => {
      mockLocationData = {
        pathname: '',
        query: { search: 'search', pageNumber: 1 },
      };

      render(<InputsTable />);
      expect(useInsightsInputs).toHaveBeenCalledWith(viewId, {
        search: 'search',
        category: undefined,
        pageNumber: 1,
        processed: true,
      });
    });
    it('adds search query to url', () => {
      const spy = jest.spyOn(clHistory, 'replace');
      render(<InputsTable />);
      fireEvent.change(screen.getByPlaceholderText('Search'), {
        target: {
          value: 'search',
        },
      });

      waitFor(() => {
        expect(spy).toHaveBeenCalledWith({
          pathname: '',
          search: `?search=search`,
        });
      });
    });
  });

  describe('Empty States', () => {
    it('renders table empty state when there are no inputs', () => {
      mockInputData = { currentPage: 1, lastPage: 1, list: [] };
      mockLocationData = { pathname: '', query: {} };
      render(<InputsTable />);
      expect(
        screen.getByTestId('insightsInputsTableEmptyState')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('insightsInputsTableEmptyAllInputs')
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
        screen.getByTestId('insightsInputsTableEmptyNoInputInCategory')
      ).toBeInTheDocument();
    });
    it('renders correct table empty state when there is no uncategorized input', () => {
      mockLocationData = { pathname: '', query: { category: '' } };
      mockInputData = { currentPage: 1, lastPage: 1, list: [] };

      render(<InputsTable />);
      expect(
        screen.getByTestId('insightsInputsTableEmptyState')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('insightsInputsTableEmptyNotCategorized')
      ).toBeInTheDocument();
    });

    it('renders correct table empty state when there is no search results', () => {
      mockLocationData = {
        pathname: '',
        query: { category: '', search: 'search' },
      };
      mockInputData = { currentPage: 1, lastPage: 1, list: [] };

      render(<InputsTable />);
      expect(
        screen.getByTestId('insightsInputsTableEmptyState')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('insightsInputsTableEmptyNoResults')
      ).toBeInTheDocument();
    });
    it('renders correct table empty state when there is no recently posted inputs', () => {
      mockLocationData = {
        pathname: '',
        query: { category: '', processed: 'false' },
      };
      mockInputData = { currentPage: 1, lastPage: 1, list: [] };

      render(<InputsTable />);
      expect(
        screen.getByTestId('insightsInputsTableRecentlyPosted')
      ).toBeInTheDocument();
    });
  });
});
