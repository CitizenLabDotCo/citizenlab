import React from 'react';
import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';
import inputs from 'modules/commercial/insights/fixtures/inputs';
import categories from 'modules/commercial/insights/fixtures/categories';

import selectEvent from 'react-select-event';
import InputDetails from './';
import { IInsightsInput } from 'modules/commercial/insights/api/inputs/types';

const viewId = '1';

const defaultProps = {
  previewedInputId: '4e9ac1f1-6928-45e9-9ac9-313e86ad636f',
  isMoveUpDisabled: false,
  isMoveDownDisabled: false,
  moveUp: jest.fn(),
  moveDown: jest.fn(),
};

let mockInputData: IInsightsInput | undefined = {
  data: inputs[0],
};

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

const mockAddInputCategories = jest.fn();
jest.mock('modules/commercial/insights/api/inputs/useAddInputCategories', () =>
  jest.fn(() => ({ mutate: mockAddInputCategories }))
);

const mockAdd = jest.fn();

jest.mock('modules/commercial/insights/api/categories/useAddCategory', () =>
  jest.fn(() => ({ mutate: mockAdd, reset: jest.fn() }))
);

jest.mock('modules/commercial/insights/api/categories/useCategories');

jest.mock('modules/commercial/insights/api/categories/useCategory', () =>
  jest.fn(() => ({ data: { data: mockCategoryData } }))
);

jest.mock('hooks/useIdea', () => {
  return jest.fn(() => mockIdeaData);
});

let mockIsLoading = false;
jest.mock('modules/commercial/insights/api/inputs/useInput', () => () => {
  return { data: mockInputData, isLoading: mockIsLoading };
});

jest.mock('utils/cl-router/withRouter', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ viewId }} />;
      };
    },
  };
});

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
    render(<InputDetails {...defaultProps} />);
    selectEvent.openMenu(screen.getByLabelText('Add a category'));

    expect(
      screen.getByText(mockCategoriesData[0].attributes.name)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(mockCategoriesData[0].attributes.name));

    expect(mockAddInputCategories).toHaveBeenCalledWith({
      viewId,
      inputId: defaultProps.previewedInputId,
      categories: [{ id: mockCategoriesData[0].id, type: 'category' }],
    });
  });
  it('adds new category to category list correctly', async () => {
    render(<InputDetails {...defaultProps} />);
    const newCategoryLabel = 'New category';
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: newCategoryLabel,
      },
    });
    expect(screen.getByText(newCategoryLabel)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('insightsCreateCategoryOption'));
    });

    expect(mockAdd).toHaveBeenCalledWith(
      {
        viewId,
        category: { name: newCategoryLabel },
      },
      {
        onSuccess: expect.any(Function),
      }
    );
  });
  it('shows loading state when loading', () => {
    mockInputData = undefined;
    mockIsLoading = true;
    render(<InputDetails {...defaultProps} />);
    expect(
      screen.getByTestId('insightsEditDetailsLoading')
    ).toBeInTheDocument();
  });
});
