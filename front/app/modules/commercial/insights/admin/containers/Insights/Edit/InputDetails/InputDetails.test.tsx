import React from 'react';
import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';
import * as insightsService from 'modules/commercial/insights/services/insightsInputs';
import * as categoryService from 'modules/commercial/insights/services/insightsCategories';
import inputs from 'modules/commercial/insights/fixtures/inputs';
import categories from 'modules/commercial/insights/fixtures/categories';

import selectEvent from 'react-select-event';
import InputDetails from './';

const viewId = '1';

const defaultProps = {
  previewedInputId: '4e9ac1f1-6928-45e9-9ac9-313e86ad636f',
  isMoveUpDisabled: false,
  isMoveDownDisabled: false,
  moveUp: jest.fn(),
  moveDown: jest.fn(),
};

let mockInputData: insightsService.IInsightsInputData | undefined = inputs[0];

const mockIdeaData = {
  id: '2',
  type: 'idea',
  attributes: {
    title_multiloc: { en: 'Test Idea' },
    body_multiploc: { en: 'Test idea body' },
  },
};

const mockCategoriesData = categories;

const mockCategoryData = {
  id: '3612e489-a631-4e7d-8bdb-63be407ea123',
  type: 'category',
  attributes: {
    name: 'Category',
  },
};

const mockCategoryDataResponse = {
  data: {
    id: 'b9f3f47a-7eb4-4db5-87ea-885fe42145c8',
    type: 'category',
    attributes: {
      name: 'Some new category',
    },
  },
};

jest.mock('modules/commercial/insights/services/insightsInputs', () => ({
  addInsightsInputCategory: jest.fn(),
}));

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(() => {
    return mockCategoryDataResponse;
  }),
}));

jest.mock('hooks/useIdea', () => {
  return jest.fn(() => mockIdeaData);
});

jest.mock('modules/commercial/insights/hooks/useInsightsInput', () => {
  return jest.fn(() => mockInputData);
});

jest.mock('modules/commercial/insights/hooks/useInsightsCategories', () => {
  return jest.fn(() => mockCategoriesData);
});

jest.mock('modules/commercial/insights/hooks/useInsightsCategory', () => {
  return jest.fn(() => mockCategoryData);
});

jest.mock('hooks/useLocale');

jest.mock('utils/cl-intl');

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ viewId }} />;
      };
    },
  };
});

jest.mock('utils/cl-router/history');

let mockFeatureFlagData = true;

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

describe('Insights Input Details', () => {
  it('renders', () => {
    render(<InputDetails {...defaultProps} />);
    expect(screen.getByTestId('insightsInputDetails')).toBeInTheDocument();
  });
  it('renders idea title and body correctly', () => {
    render(<InputDetails {...defaultProps} />);
    expect(screen.getByTestId('insightsIdeaTitle')).toBeInTheDocument();
    expect(screen.getByTestId('insightsIdeaBody')).toBeInTheDocument();
  });
  it('renders correct number of categories', () => {
    render(<InputDetails {...defaultProps} />);
    expect(screen.getAllByTestId('insightsTag')).toHaveLength(4);
    expect(screen.getAllByTestId('insightsTagContent-primary')).toHaveLength(2);
    expect(screen.getAllByTestId('insightsTagContent-default')).toHaveLength(2);
  });
  it('renders correct number of categories with nlp feature flag disabled', () => {
    mockFeatureFlagData = false;
    render(<InputDetails {...defaultProps} />);
    expect(screen.getAllByTestId('insightsTag')).toHaveLength(2);
    expect(screen.getAllByTestId('insightsTagContent-primary')).toHaveLength(2);
    expect(
      screen.queryByTestId('insightsTagContent-default')
    ).not.toBeInTheDocument();
  });
  it('adds existing category to category list correctly', async () => {
    const spy = jest.spyOn(insightsService, 'addInsightsInputCategory');
    render(<InputDetails {...defaultProps} />);
    selectEvent.openMenu(screen.getByLabelText('Add a category'));

    expect(
      screen.getByText(mockCategoriesData[0].attributes.name)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(mockCategoriesData[0].attributes.name));
    await act(async () => {
      fireEvent.click(screen.getByText('+'));
    });

    expect(spy).toHaveBeenCalledWith(
      viewId,
      defaultProps.previewedInputId,
      mockCategoriesData[0].id
    );
  });
  it('adds new category to category list correctly', async () => {
    const spyAddInputCategory = jest.spyOn(
      insightsService,
      'addInsightsInputCategory'
    );
    const spyAddCategory = jest.spyOn(categoryService, 'addInsightsCategory');

    render(<InputDetails {...defaultProps} />);
    const newCategoryLabel = 'Create "New category"';
    fireEvent.change(screen.getByLabelText('Add a category'), {
      target: {
        value: 'New category',
      },
    });
    expect(screen.getByText(newCategoryLabel)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText(newCategoryLabel));
    });

    expect(spyAddCategory).toHaveBeenCalledWith(viewId, 'New category');
    expect(spyAddInputCategory).toHaveBeenCalledWith(
      viewId,
      defaultProps.previewedInputId,
      mockCategoryDataResponse.data.id
    );
  });
  it('shows loading state when loading', () => {
    mockInputData = undefined;
    render(<InputDetails {...defaultProps} />);
    expect(
      screen.getByTestId('insightsEditDetailsLoading')
    ).toBeInTheDocument();
  });
});
