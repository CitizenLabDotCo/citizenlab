import React from 'react';
import Inputs from './';

import {
  render,
  screen,
  // fireEvent,
  // within,
  // act,
  // waitFor,
} from 'utils/testUtils/rtl';
// import * as service from 'modules/commercial/insights/services/insightsInputs';
// import useInsightsInputsLoadMore from 'modules/commercial/insights/hooks/useInsightsInputsLoadMore';
import inputs from 'modules/commercial/insights/fixtures/inputs';

// import clHistory from 'utils/cl-router/history';

jest.mock('modules/commercial/insights/services/insightsInputs', () => ({
  deleteInsightsInputCategory: jest.fn(),
}));

jest.mock('modules/commercial/insights/services/batchAssignment', () => ({
  batchAssignCategories: jest.fn(),
  batchUnassignCategories: jest.fn(),
}));

const viewId = '1';

let mockInputsData = {
  currentPage: 1,
  lastPage: 2,
  list: inputs,
};

const mockIdeaData = {
  id: '2',
  type: 'idea',
  attributes: {
    title_multiloc: { en: 'Test Idea' },
  },
};

const mockLocationData = { pathname: '', query: {} };

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
  it('renders empty state', () => {
    mockInputsData = {
      currentPage: 1,
      lastPage: 1,
      list: [],
    };
    render(<Inputs />);
    expect(screen.getByTestId('insightsDetailsEmpty')).toBeInTheDocument();
  });
});
