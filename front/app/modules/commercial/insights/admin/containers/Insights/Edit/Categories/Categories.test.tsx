import React from 'react';
import { render, screen, fireEvent, act, waitFor } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsCategories';
import clHistory from 'utils/cl-router/history';
import categories from 'modules/commercial/insights/fixtures/categories';

import Categories from './';

let mockData = categories;
let mockDetectedCategoriesData = categories;

const viewId = '1';

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
  deleteInsightsCategories: jest.fn(),
  deleteInsightsCategory: jest.fn(),
}));

jest.mock('modules/commercial/insights/hooks/useInsightsCategories', () => {
  return jest.fn(() => mockData);
});

jest.mock(
  'modules/commercial/insights/hooks/useInsightsDetectedCategories',
  () => {
    return jest.fn(() => mockDetectedCategoriesData);
  }
);

const allInputsCount = 10;
const uncategorizedInputCount = 5;
const recentlyPostedInputCount = 2;

jest.mock('modules/commercial/insights/hooks/useInsightsInputsCount', () => {
  return jest.fn((_viewId, queryParameters) => {
    return queryParameters.processed === false
      ? { count: recentlyPostedInputCount }
      : queryParameters.processed === true &&
        queryParameters.categories === undefined
      ? { count: allInputsCount }
      : { count: uncategorizedInputCount };
  });
});

jest.mock('hooks/useLocale');
jest.mock('services/locale');
jest.mock('utils/analytics');

let mockFeatureFlagData = true;

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

const mockLocationData = { pathname: '', query: {} };

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
    expect(service.deleteInsightsCategory).toHaveBeenCalledWith(
      viewId,
      mockData[0].id
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

    expect(service.addInsightsCategory).toHaveBeenCalledWith({
      insightsViewId: viewId,
      name: categoryName,
    });
  });
  it('resets categories', async () => {
    const historySpy = jest.spyOn(clHistory, 'push');
    const spy = jest.spyOn(service, 'deleteInsightsCategories');
    render(<Categories />);
    fireEvent.click(screen.getByTestId('insightsResetMenu'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('insightsResetButton'));
    });

    expect(spy).toHaveBeenCalledWith(viewId);
    expect(historySpy).toHaveBeenCalledWith({
      pathname: '',
      search: `?pageNumber=1&processed=false`,
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
  it('shows detect categories button when nlp feature Flag is active and categories are detected', async () => {
    render(<Categories />);
    expect(screen.getByTestId('insightsDetectCategories')).toBeInTheDocument();
  });
  it('does not show detect categories button when nlp feature Flag is not acitve', async () => {
    mockFeatureFlagData = false;
    render(<Categories />);
    expect(
      screen.queryByTestId('insightsDetectCategories')
    ).not.toBeInTheDocument();
  });
  it('does not show detect categories button when categories are not detected', async () => {
    mockFeatureFlagData = true;
    mockDetectedCategoriesData = [];
    render(<Categories />);
    expect(
      screen.queryByTestId('insightsDetectCategories')
    ).not.toBeInTheDocument();
  });
});
