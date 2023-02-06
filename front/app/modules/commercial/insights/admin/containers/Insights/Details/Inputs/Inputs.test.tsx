import React from 'react';
import Inputs from './';

import { render, screen } from 'utils/testUtils/rtl';
import inputs from 'modules/commercial/insights/fixtures/inputs';
import categories from 'modules/commercial/insights/fixtures/categories';

const viewId = '1';

let mockInputsData = {
  loading: false,
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

jest.mock('modules/commercial/insights/api/categories/useCategories');

jest.mock('modules/commercial/insights/api/views');

const defaultProps = {
  inputs,
  onPreviewInput: jest.fn(),
  onLoadMore: jest.fn(),
  loading: false,
  hasMore: false,
};
describe('Insights Details Inputs', () => {
  it('renders', () => {
    render(<Inputs {...defaultProps} />);
    expect(screen.getByTestId('insightsDetailsInputs')).toBeInTheDocument();
  });

  it('renders categories', () => {
    mockLocationData = {
      pathname: '',
      query: { categories: [categories[0].id, categories[1].id] },
    };
    render(<Inputs {...defaultProps} />);
    expect(screen.getByText(categories[0].attributes.name)).toBeInTheDocument();
    expect(screen.getByText(categories[1].attributes.name)).toBeInTheDocument();
  });

  it('renders correct number of input cards', () => {
    render(<Inputs {...defaultProps} />);
    expect(screen.getAllByTestId('insightsInputCard')).toHaveLength(
      mockInputsData.list.length
    );
  });

  it('shows load more button when there is a next page', () => {
    render(<Inputs {...defaultProps} hasMore={true} />);
    expect(screen.getByTestId('insightsDetailsLoadMore')).toBeInTheDocument();
  });

  it('does not show load more button when there is no next page', () => {
    mockInputsData = {
      hasMore: false,
      list: inputs,
      loading: false,
    };
    render(<Inputs {...defaultProps} hasMore={false} />);
    expect(
      screen.queryByTestId('insightsDetailsLoadMore')
    ).not.toBeInTheDocument();
  });

  it('shows Create category button when there are inputs', () => {
    render(<Inputs {...defaultProps} />);
    expect(
      screen.getByTestId('insightsDetailsCreateCategory')
    ).toBeInTheDocument();
  });

  it('does not show Create category button when there are no inputs', () => {
    render(<Inputs {...defaultProps} inputs={[]} />);
    expect(
      screen.queryByTestId('insightsDetailsCreateCategory')
    ).not.toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<Inputs {...defaultProps} inputs={[]} />);
    expect(screen.getByTestId('insightsDetailsEmpty')).toBeInTheDocument();
  });
});
