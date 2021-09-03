import React from 'react';
import { render, screen, fireEvent, within } from 'utils/testUtils/rtl';
import * as insightsService from 'modules/commercial/insights/services/insightsInputs';
import inputs from 'modules/commercial/insights/fixtures/inputs';
import categories from 'modules/commercial/insights/fixtures/categories';
import useInsightsInput from 'modules/commercial/insights/hooks/useInsightsInput';

import Preview from './';

const viewId = '1';

const previewedInputId = '2';

const defaultProps = {
  previewedInputId: '4e9ac1f1-6928-45e9-9ac9-313e86ad636f',
  closePreview: jest.fn(),
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
        return (
          <Component
            {...props}
            params={{ viewId }}
            location={{ query: { previewedInputId } }}
          />
        );
      };
    },
  };
});

jest.mock('utils/cl-router/history');

describe('Insights Input Details', () => {
  it('renders', () => {
    render(<Preview {...defaultProps} />);
    expect(screen.getByTestId('insightsDetailsPreview')).toBeInTheDocument();
  });
  it('calls useInsightsInput correctly', () => {
    render(<Preview {...defaultProps} />);
    expect(useInsightsInput).toHaveBeenCalledWith(viewId, previewedInputId);
  });
  it('renders idea title and body correctly', () => {
    render(<Preview {...defaultProps} />);
    expect(screen.getByTestId('insightsIdeaTitle')).toBeInTheDocument();
    expect(screen.getByTestId('insightsIdeaBody')).toBeInTheDocument();
  });
  it('renders correct number of categories', () => {
    render(<Preview {...defaultProps} />);
    expect(screen.getAllByTestId('insightsTagContent-primary')).toHaveLength(2);
  });

  it('closes preview on close click', () => {
    render(<Preview {...defaultProps} />);
    fireEvent.click(
      within(screen.getByTestId('insightsDetailsPreviewClose')).getByRole(
        'button'
      )
    );
    expect(defaultProps.closePreview).toHaveBeenCalled();
  });

  it('shows loading state when loading', () => {
    mockInputData = undefined;
    render(<Preview {...defaultProps} />);
    expect(
      screen.getByTestId('insightsDetailsPreviewLoading')
    ).toBeInTheDocument();
  });
});
