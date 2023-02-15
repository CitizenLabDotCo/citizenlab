import React from 'react';
import { render, screen, fireEvent, act, waitFor } from 'utils/testUtils/rtl';
import clHistory from 'utils/cl-router/history';
import categories from 'modules/commercial/insights/fixtures/categories';

import Categories from './';

let mockData = categories;

const viewId = '1';

const mockAdd = jest.fn();
const mockDelete = jest.fn();
const mockDeleteAll = jest.fn();

jest.mock('modules/commercial/insights/api/categories/useCategories', () =>
  jest.fn(() => ({ data: { data: mockData } }))
);

jest.mock('modules/commercial/insights/api/categories/useAddCategory', () =>
  jest.fn(() => ({ mutate: mockAdd, reset: jest.fn() }))
);

jest.mock('modules/commercial/insights/api/categories/useDeleteCategory', () =>
  jest.fn(() => ({ mutate: mockDelete, reset: jest.fn() }))
);

jest.mock(
  'modules/commercial/insights/api/categories/useDeleteAllCategories',
  () => jest.fn(() => ({ mutate: mockDeleteAll, reset: jest.fn() }))
);

const allInputsCount = 10;
const uncategorizedInputCount = 5;
const recentlyPostedInputCount = 2;

jest.mock('modules/commercial/insights/api/stats/useStat', () =>
  jest.fn((_viewId, queryParameters) => ({
    data: {
      data:
        queryParameters.processed === false
          ? { count: recentlyPostedInputCount }
          : queryParameters.processed === true &&
            queryParameters.categories === undefined
          ? { count: allInputsCount }
          : { count: uncategorizedInputCount },
    },
  }))
);

jest.mock('utils/analytics');

const mockFeatureFlagData = true;

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

const mockLocationData = { pathname: '', query: {} };

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

describe('Insights Edit Categories', () => {
  it('renders correct number of categories', () => {
    render(<Categories />);
    expect(screen.getAllByTestId('insightsCategory')).toHaveLength(
      mockData.length
    );
  });
  it('selects category correctly', () => {
    const spy = jest.spyOn(clHistory, 'push');
    render(<Categories />);
    fireEvent.click(screen.getByText(mockData[0].attributes.name));
    expect(spy).toHaveBeenCalledWith({
      pathname: '',
      search: `?pageNumber=1&category=${mockData[0].id}`,
    });
  });

  it('selects all input correctly', () => {
    const spy = jest.spyOn(clHistory, 'push');
    render(<Categories />);
    fireEvent.click(screen.getAllByText('All input')[0]);
    expect(spy).toHaveBeenCalledWith({
      pathname: '',
      search: `?pageNumber=1&processed=true`,
    });
  });

  it('selects uncategorized input correctly', () => {
    const spy = jest.spyOn(clHistory, 'push');
    render(<Categories />);
    fireEvent.click(screen.getAllByText('Not categorized')[0]);
    expect(spy).toHaveBeenCalledWith({
      pathname: '',
      search: `?pageNumber=1&category=&processed=true`,
    });
  });

  it('shows category count correctly', () => {
    render(<Categories />);

    expect(screen.getAllByTestId('insightsCategoryCount')[0]).toHaveTextContent(
      mockData[0].attributes.inputs_count.toString()
    );
    expect(screen.getAllByTestId('insightsCategoryCount')[1]).toHaveTextContent(
      mockData[1].attributes.inputs_count.toString()
    );
  });
  it('deletes a category when delete icon is clicked', async () => {
    render(<Categories />);
    fireEvent.mouseOver(screen.getByText(mockData[0].attributes.name));

    await waitFor(() =>
      fireEvent.click(screen.getAllByTestId('insightsDeleteCategoryIcon')[0])
    );
    expect(mockDelete).toHaveBeenCalledWith(
      {
        viewId,
        categoryId: mockData[0].id,
      },
      {
        onSuccess: expect.any(Function),
      }
    );
  });
  it('renders Infobox when no categories are available', () => {
    mockData = [];
    render(<Categories />);
    expect(screen.getByTestId('insightsNoCategories')).toBeInTheDocument();
  });
  it('adds category with correct view id and name', async () => {
    const categoryName = 'New category';

    render(<Categories />);

    fireEvent.input(screen.getByPlaceholderText('Add category'), {
      target: {
        value: categoryName,
      },
    });

    await act(async () => {
      fireEvent.click(screen.getByText('+'));
    });

    expect(mockAdd).toHaveBeenCalledWith(
      {
        viewId,
        category: { name: categoryName },
      },
      {
        onSuccess: expect.any(Function),
      }
    );
  });
  it('resets categories', async () => {
    render(<Categories />);
    fireEvent.click(screen.getByTestId('insightsResetMenu'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('insightsResetButton'));
    });

    expect(mockDeleteAll).toHaveBeenCalledWith(viewId, {
      onSuccess: expect.any(Function),
    });
  });
  it('shows all input category count correctly', () => {
    render(<Categories />);
    expect(screen.getByTestId('insightsAllInputsCount')).toHaveTextContent(
      allInputsCount.toString()
    );
  });

  it('shows recently posted input category count correctly', () => {
    render(<Categories />);
    expect(
      screen.getByTestId('insightsRecentlyPostedInputsCount')
    ).toHaveTextContent(recentlyPostedInputCount.toString());
  });
  it('shows uncategorized category count correctly', () => {
    render(<Categories />);
    expect(
      screen.getByTestId('insightsUncategorizedInputsCount')
    ).toHaveTextContent(uncategorizedInputCount.toString());
  });
});
