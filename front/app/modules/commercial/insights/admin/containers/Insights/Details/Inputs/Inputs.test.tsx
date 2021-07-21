import React from 'react';
import Inputs from './';

import { render, screen } from 'utils/testUtils/rtl';
import useInsightsInputsLoadMore from 'modules/commercial/insights/hooks/useInsightsInputsLoadMore';
import inputs from 'modules/commercial/insights/fixtures/inputs';

jest.mock('modules/commercial/insights/services/insightsInputs', () => ({
  deleteInsightsInputCategory: jest.fn(),
}));

jest.mock('modules/commercial/insights/services/batchAssignment', () => ({
  batchAssignCategories: jest.fn(),
  batchUnassignCategories: jest.fn(),
}));

const viewId = '1';

let mockInputsData = {
  hasMore: true,
  list: inputs,
};

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

jest.mock('modules/commercial/insights/hooks/useInsightsInputsLoadMore', () => {
  return jest.fn(() => mockInputsData);
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

describe('Insights Details Inputs', () => {
  it('renders', () => {
    render(<Inputs />);
    expect(screen.getByTestId('insightsDetailsInputs')).toBeInTheDocument();
  });
  it('calls useInsightsInputsLoadMore with correct arguments', () => {
    mockLocationData = {
      pathname: '',
      query: { search: 'search', pageNumber: 1, category: 'category' },
    };
    render(<Inputs />);
    expect(useInsightsInputsLoadMore).toHaveBeenCalledWith(
      viewId,
      mockLocationData.query
    );
  });
  it('renders correct number of input cards', () => {
    render(<Inputs />);
    expect(screen.getAllByTestId('insightsInputCard')).toHaveLength(
      mockInputsData.list.length
    );
  });

  it('shows load more button when there is a next page', () => {
    render(<Inputs />);
    expect(screen.getByTestId('insightsDetailsLoadMore')).toBeInTheDocument();
  });

  it('does not show load more button when there is no next page', () => {
    mockInputsData = {
      hasMore: false,
      list: inputs,
    };
    render(<Inputs />);
    expect(
      screen.queryByTestId('insightsDetailsLoadMore')
    ).not.toBeInTheDocument();
  });

  it('renders empty state', () => {
    mockInputsData = {
      hasMore: false,
      list: [],
    };
    render(<Inputs />);
    expect(screen.getByTestId('insightsDetailsEmpty')).toBeInTheDocument();
  });
});
