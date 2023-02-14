import React from 'react';
import {
  render,
  screen,
  fireEvent,
  within,
  act,
  waitFor,
} from 'utils/testUtils/rtl';
import inputs from 'modules/commercial/insights/fixtures/inputs';
import useInputs from 'modules/commercial/insights/api/inputs/useInputs';
import clHistory from 'utils/cl-router/history';
import categories from 'modules/commercial/insights/fixtures/categories';
import links from 'modules/commercial/insights/fixtures/links';

const mockAddInputCategories = jest.fn();
jest.mock('modules/commercial/insights/api/inputs/useAddInputCategories', () =>
  jest.fn(() => ({ mutate: mockAddInputCategories }))
);

const mockDeletenputCategory = jest.fn();
jest.mock('modules/commercial/insights/api/inputs/useDeleteInputCategory', () =>
  jest.fn(() => ({ mutate: mockDeletenputCategory }))
);

jest.mock('modules/commercial/insights/api/categories/useCategories');
jest.mock('modules/commercial/insights/api/categories/useCategory');

const mockAssign = jest.fn();
jest.mock(
  'modules/commercial/insights/api/batch/useBatchAssignCategories',
  () => jest.fn(() => ({ mutate: mockAssign }))
);
const mockUnassign = jest.fn();
jest.mock(
  'modules/commercial/insights/api/batch/useBatchUnassignCategories',
  () => jest.fn(() => ({ mutate: mockUnassign }))
);

import InputsTable from './';

const viewId = '1';

let mockInputData = inputs;

const mockIdeaData = {
  id: '2',
  type: 'idea',
  attributes: {
    title_multiloc: { en: 'Test Idea' },
  },
};

let mockLocationData = { pathname: '', query: {} };

jest.mock('hooks/useIdea', () => {
  return jest.fn(() => mockIdeaData);
});

jest.mock('modules/commercial/insights/api/views/useView');

const mockLinks = links;
const mockIsLoading = false;
jest.mock('modules/commercial/insights/api/inputs/useInputs', () =>
  jest.fn(() => {
    return {
      data: { data: mockInputData, links: mockLinks },
      isLoading: mockIsLoading,
    };
  })
);

jest.mock('utils/cl-router/withRouter', () => {
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

const mockTriggerScan = jest.fn();

jest.mock(
  'modules/commercial/insights/api/category_suggestions/useScanForCategorySuggestions',
  () => {
    return jest.fn(() => ({
      triggerScan: mockTriggerScan,
      onDone: jest.fn(),
      status: 'isIdle',
      progress: 0,
      isLoading: false,
    }));
  }
);

let mockFeatureFlagData = true;

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

describe('Insights Input Table', () => {
  it('renders', () => {
    render(<InputsTable />);
    expect(screen.getByTestId('insightsInputsTable')).toBeInTheDocument();
  });

  describe('Rows general display and function', () => {
    it('renders correct number of rows', () => {
      render(<InputsTable />);
      expect(screen.getAllByTestId('insightsInputsTableRow')).toHaveLength(
        mockInputData.length
      );
    });
    it('adds previewedInputId to url correctly on row click', () => {
      render(<InputsTable />);
      fireEvent.click(screen.getAllByTestId('insightsInputsTableRow')[0]);
      expect(clHistory.replace).toHaveBeenCalledWith({
        pathname: '',
        search: `?previewedInputId=${mockInputData[0].id}`,
      });
    });
    it('renders list of categories correctly', () => {
      render(<InputsTable />);
      const firstRow = screen.getAllByTestId('insightsInputsTableRow')[0];
      const secondRow = screen.getAllByTestId('insightsInputsTableRow')[1];
      expect(within(firstRow).getAllByTestId('insightsTag')).toHaveLength(4);
      expect(
        within(firstRow).getAllByTestId('insightsTagContent-default')
      ).toHaveLength(2);
      expect(
        within(firstRow).getAllByTestId('insightsTagContent-primary')
      ).toHaveLength(2);
      expect(within(secondRow).queryAllByTestId('insightsTag')).toHaveLength(1);
    });
    it('renders list of categories correctly when there is no nlp feature flag', () => {
      mockFeatureFlagData = false;
      render(<InputsTable />);
      const firstRow = screen.getAllByTestId('insightsInputsTableRow')[0];
      const secondRow = screen.getAllByTestId('insightsInputsTableRow')[1];
      expect(within(firstRow).getAllByTestId('insightsTag')).toHaveLength(2);
      expect(
        within(firstRow).queryByTestId('insightsTagContent-default')
      ).not.toBeInTheDocument();
      expect(
        within(firstRow).getAllByTestId('insightsTagContent-primary')
      ).toHaveLength(2);
      expect(
        within(secondRow).queryByTestId('insightsTag')
      ).not.toBeInTheDocument();
    });
    it('calls onDelete category with correct arguments', () => {
      render(<InputsTable />);
      const firstTagDeleteIcon = screen
        .getAllByTestId('insightsTagContent-primary')[0]
        .querySelector('.insightsTagCloseIcon');
      if (firstTagDeleteIcon) {
        fireEvent.click(firstTagDeleteIcon);
      }

      expect(mockDeletenputCategory).toHaveBeenCalledWith({
        viewId,
        inputId: mockInputData[0].id,
        categoryId: mockInputData[0].relationships.categories.data[0].id,
      });
    });
    describe('Scan category button', () => {
      it('renders scan category button when category is selected', () => {
        mockLocationData = { pathname: '', query: { category: 'Category 1' } };
        mockFeatureFlagData = true;
        render(<InputsTable />);
        expect(
          screen.getByTestId('insightsScanCategory-button')
        ).toBeInTheDocument();
      });
      it('calls triggerScan on button click', () => {
        mockLocationData = { pathname: '', query: { category: 'Category 1' } };
        render(<InputsTable />);

        fireEvent.click(screen.getByTestId('insightsScanCategory-button'));
        expect(mockTriggerScan).toHaveBeenCalled();
      });
      it('does not render scan category button when there is no input', () => {
        mockInputData = [];
        mockLocationData = { pathname: '', query: { category: '' } };
        mockFeatureFlagData = true;
        render(<InputsTable />);
        expect(
          screen.queryByTestId('insightsScanCategory-button')
        ).not.toBeInTheDocument();
      });
      it('does not render scan category button when feature flag is disabled', () => {
        mockLocationData = { pathname: '', query: { category: 'Category 1' } };
        mockFeatureFlagData = false;
        render(<InputsTable />);
        expect(
          screen.queryByTestId('insightsScanCategory-button')
        ).not.toBeInTheDocument();
      });
    });
    describe('Additional Column', () => {
      it('renders additional table column when category is selected', () => {
        mockInputData = inputs;
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
            query: { category: categories[0].id },
          };
          mockInputData = inputs;

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
          mockInputData = inputs;

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
          query: { category: categories[0].id },
        };
        mockInputData = inputs;
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
              within(
                screen.getByTestId('insightsTableActionsBulkAssign')
              ).getByRole('button')
            );
          });
          await act(async () => {
            fireEvent.click(
              within(screen.getByTestId('insightsTableActions')).getByText(
                categories[1].attributes.name
              )
            );
          });
          expect(
            within(screen.getByTestId('insightsTableActions')).queryAllByText(
              categories[0].attributes.name
            )
          ).toHaveLength(0);
          await act(async () => {
            fireEvent.click(screen.getByText('Add'));
          });

          expect(mockAssign).toHaveBeenCalledWith(
            {
              viewId: '1',
              inputs: [mockInputData[0].id],
              categories: [categories[1].id],
            },
            {
              onSuccess: expect.any(Function),
            }
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
          expect(mockUnassign).toHaveBeenCalledWith(
            {
              viewId: '1',
              inputs: [mockInputData[0].id],
              categories: [categories[0].id],
            },
            {
              onSuccess: expect.any(Function),
            }
          );
        });
        it('has an approve button that works as expected', async () => {
          mockFeatureFlagData = true;
          fireEvent.click(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))[1]
          );
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([true, true]);

          await act(async () => {
            fireEvent.click(screen.getByText('Approve'));
          });

          expect(mockAddInputCategories).toHaveBeenCalledTimes(2);
          expect(mockAddInputCategories).toHaveBeenCalledWith({
            viewId: '1',
            inputId: mockInputData[0].id,
            categories:
              mockInputData[0].relationships.suggested_categories.data,
          });
          expect(mockAddInputCategories).toHaveBeenLastCalledWith({
            viewId: '1',
            inputId: mockInputData[1].id,
            categories:
              mockInputData[1].relationships.suggested_categories.data,
          });
        });
        it('does not render approve button when nlp feature flag is disabled', () => {
          mockFeatureFlagData = false;
          fireEvent.click(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))[1]
          );
          expect(
            screen
              .getAllByTestId('insightsInputsTableRow')
              .map((row) => within(row).getByRole('checkbox'))
              .map((box: any) => box.checked)
          ).toEqual([true, true]);

          expect(screen.queryByText('Approve')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Pagination', () => {
    it('shows pagination when there are multiple pages', () => {
      mockInputData = inputs;
      render(<InputsTable />);
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
    it('clicks on pagination navigate to the right page', () => {
      mockLocationData = {
        query: {},
        pathname: 'editViewPagePath',
      };
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
      expect(useInputs).toHaveBeenCalledWith(viewId, {
        category: undefined,
        pageNumber: 2,
        processed: true,
        search: undefined,
      });
    });
    it("doesn't show pagination when there's only one page", () => {
      mockLinks.last = links.self;
      mockInputData = inputs;
      render(<InputsTable />);
      expect(screen.queryByTestId('pagination')).toBeNull();
    });
  });
  describe('Sorting', () => {
    it('sorts categories for -approval when category is selected', () => {
      const spy = jest.spyOn(clHistory, 'push');
      mockLocationData = {
        pathname: '',
        query: {
          category: mockInputData[0].relationships.categories.data[0].id,
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
          category: mockInputData[0].relationships.categories.data[0].id,
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
      expect(useInputs).toHaveBeenCalledWith(viewId, {
        category: 'category',
        processed: undefined,
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
      expect(useInputs).toHaveBeenCalledWith(viewId, {
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
      expect(useInputs).toHaveBeenCalledWith(viewId, {
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
      mockInputData = [];
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
        query: { category: categories[0].id },
      };
      mockInputData = [];
      mockFeatureFlagData = true;

      render(<InputsTable />);
      expect(
        screen.getByTestId('insightsScanCategory-banner')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('insightsInputsTableEmptyState')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('insightsInputsTableEmptyNoInputInCategory')
      ).toBeInTheDocument();
    });
    it('renders correct table empty state when there is no uncategorized input', () => {
      mockLocationData = { pathname: '', query: { category: '' } };
      mockInputData = [];

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
      mockInputData = [];

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
      mockInputData = [];

      render(<InputsTable />);
      expect(
        screen.getByTestId('insightsInputsTableRecentlyPosted')
      ).toBeInTheDocument();
    });
  });
});
