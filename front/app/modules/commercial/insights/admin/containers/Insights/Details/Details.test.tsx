import React from 'react';
import Details from './';

import { render, fireEvent, screen } from 'utils/testUtils/rtl';
import inputs from 'modules/commercial/insights/fixtures/inputs';
import clHistory from 'utils/cl-router/history';
import useInfiniteInputs from 'modules/commercial/insights/api/inputs/useInfiniteInputs';
import { ideaData as mockIdeaData } from 'api/ideas/__mocks__/useIdeaById';

const viewId = '1';
let mockLocationData = { pathname: '', query: {} };

jest.mock('modules/commercial/insights/api/categories/useCategories');

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

jest.mock('api/ideas/useIdeaById', () => {
  return jest.fn(() => ({ data: { data: mockIdeaData[0] } }));
});

jest.mock('./Network', () => {
  return () => <div />;
});

jest.mock('modules/commercial/insights/api/views/useView');
jest.mock('modules/commercial/insights/api/inputs/useInfiniteInputs');
jest.mock('modules/commercial/insights/api/inputs/useInput');

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
      search: `?previewedInputId=${inputs[0].id}`,
    });
  });
  it('renders input when previewedInputId is in url', () => {
    mockLocationData = {
      pathname: '',
      query: { previewedInputId: inputs[0].id },
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
      search: `?previewedInputId=${inputs[0].id}`,
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
