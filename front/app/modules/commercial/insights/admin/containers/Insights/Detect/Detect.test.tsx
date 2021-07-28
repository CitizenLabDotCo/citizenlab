import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
// import * as service from 'modules/commercial/insights/services/insightsDetectCategories';
// import clHistory from 'utils/cl-router/history';

import Detect from './';

const mockData = { names: ['Test', 'Test 2'] };

const viewId = '1';

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
  deleteInsightsCategories: jest.fn(),
  deleteInsightsCategory: jest.fn(),
}));

jest.mock(
  'modules/commercial/insights/hooks/useInsightsDetectedCategories',
  () => {
    return jest.fn(() => mockData);
  }
);

jest.mock('hooks/useLocale');

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

describe('Insights Detect Categories', () => {
  it('renders', () => {
    render(<Detect />);
    expect(screen.getByTestId('insightsDetect')).toBeInTheDocument();
  });
});
