import React from 'react';
import { render, screen, fireEvent, within } from 'utils/testUtils/rtl';
import clHistory from 'utils/cl-router/history';

import Preview from './';
import useInput from 'modules/commercial/insights/api/inputs/useInput';
import inputs from 'modules/commercial/insights/fixtures/inputs';

const viewId = '1';

const previewedInputId = '2';

const defaultProps = {
  previewedInputId: '4e9ac1f1-6928-45e9-9ac9-313e86ad636f',
};

let mockInputData: { data: typeof inputs[0] } | undefined = {
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

jest.mock('hooks/useIdea', () => {
  return jest.fn(() => mockIdeaData);
});

let mockIsLoading = false;
jest.mock('modules/commercial/insights/api/inputs/useInput', () =>
  jest.fn(() => {
    return { data: mockInputData, isLoading: mockIsLoading };
  })
);

jest.mock('modules/commercial/insights/api/categories/useCategory');

jest.mock('utils/cl-router/withRouter', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return (
          <Component
            {...props}
            params={{ viewId }}
            location={{ pathname: '', query: { previewedInputId } }}
          />
        );
      };
    },
  };
});

describe('Insights Input Details', () => {
  it('renders', () => {
    render(<Preview {...defaultProps} />);
    expect(screen.getByTestId('insightsDetailsPreview')).toBeInTheDocument();
  });
  it('calls useInsightsInput correctly', () => {
    render(<Preview {...defaultProps} />);
    expect(useInput).toHaveBeenCalledWith(viewId, previewedInputId);
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
    expect(clHistory.replace).toHaveBeenCalledWith({
      pathname: '',
      search: '',
    });
  });

  it('shows loading state when loading', () => {
    mockInputData = undefined;
    mockIsLoading = true;
    render(<Preview {...defaultProps} />);
    expect(
      screen.getByTestId('insightsDetailsPreviewLoading')
    ).toBeInTheDocument();
  });
});
