import React from 'react';
import Details from './';

import { render, fireEvent, screen } from 'utils/testUtils/rtl';
import inputs from 'modules/commercial/insights/fixtures/inputs';
import clHistory from 'utils/cl-router/history';
import mockCategories from 'modules/commercial/insights/fixtures/categories';
import { useInfiniteInputs } from 'modules/commercial/insights/api/inputs';
const viewId = '1';

const mockInputsData = {
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

const mockInputData = inputs[0];

jest.mock('utils/cl-router/history');

jest.mock('modules/commercial/insights/hooks/useInsightsCategories', () => {
  return jest.fn(() => mockCategories);
});

jest.mock('hooks/useLocale');

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
jest.mock('utils/cl-router/Link');
jest.mock('utils/cl-router/history');
jest.mock('utils/cl-intl');

jest.mock('hooks/useIdea', () => {
  return jest.fn(() => mockIdeaData);
});

jest.mock('modules/commercial/insights/hooks/useInsightsInput', () => {
  return jest.fn(() => mockInputData);
});

jest.mock('./Network', () => {
  return () => <div />;
});

jest.mock('modules/commercial/insights/api/views');
jest.mock('modules/commercial/insights/api/inputs');

describe('Insights Details Inputs', () => {
  it('renders', () => {
    render(<Details />);
    expect(screen.getByTestId('insightsDetails')).toBeInTheDocument();
    expect(screen.getByTestId('insightsDetailsCategories')).toBeInTheDocument();
    expect(screen.getByTestId('insightsDetailsInputs')).toBeInTheDocument();
  });
  it('adds previewInputId to url correctly', () => {
    render(<Details />);
    fireEvent.click(screen.getAllByTestId('insightsInputCard')[0]);
    expect(clHistory.replace).toHaveBeenCalledWith({
      pathname: '',
      search: `?previewedInputId=${mockInputsData.list[0].id}`,
    });
  });
  it('renders input when previewedInputId is in url', () => {
    mockLocationData = {
      pathname: '',
      query: { previewedInputId: mockInputsData.list[0].id },
    };
    render(<Details />);
    expect(screen.getByTestId('insightsDetailsPreview')).toBeInTheDocument();
  });
  it('does not render input when previewedInputId is not in url', () => {
    mockLocationData = { pathname: '', query: { previewedInputId: undefined } };

    render(<Details />);

    expect(
      screen.queryByTestId('insightsDetailsPreview')
    ).not.toBeInTheDocument();
  });
  it('adds previewedInputId to url on input card click', () => {
    render(<Details />);
    fireEvent.click(screen.getAllByTestId('insightsInputCard')[0]);

    expect(clHistory.replace).toHaveBeenCalledWith({
      pathname: '',
      search: `?previewedInputId=${mockInputsData.list[0].id}`,
    });
  });
  it('calls useInfiniteInputs with correct arguments', () => {
    mockLocationData = {
      pathname: '',
      query: {
        search: 'search',
        categories: ['category1', 'category2'],
        keywords: ['keyword'],
      },
    };
    render(<Details />);
    expect(useInfiniteInputs).toHaveBeenCalledWith(
      viewId,
      mockLocationData.query
    );
  });
});
