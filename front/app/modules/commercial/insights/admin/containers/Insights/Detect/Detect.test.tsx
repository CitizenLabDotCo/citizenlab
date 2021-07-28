import React from 'react';
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from 'utils/testUtils/rtl';
import { addInsightsCategory } from 'modules/commercial/insights/services/insightsCategories';

import Detect from './';

const mockData = { names: ['Test', 'Test 2', 'Test 3'] };

const viewId = '1';

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
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

  it('shows the correct number of categories', () => {
    render(<Detect />);
    expect(screen.getAllByTestId('insightsTag')).toHaveLength(
      mockData.names.length
    );
    expect(screen.getAllByTestId('insightsTagContent-default')).toHaveLength(
      mockData.names.length
    );
  });

  it('selects and deselects categories correctly', () => {
    render(<Detect />);
    fireEvent.click(screen.getAllByTestId('insightsTagIconContainer')[0]);
    fireEvent.click(screen.getAllByTestId('insightsTagIconContainer')[1]);

    expect(screen.getAllByTestId('insightsTagContent-primary')).toHaveLength(2);
    expect(screen.getAllByTestId('insightsTagContent-default')).toHaveLength(1);

    fireEvent.click(screen.getAllByTestId('insightsTagIconContainer')[0]);
    fireEvent.click(screen.getAllByTestId('insightsTagIconContainer')[1]);

    expect(screen.queryAllByTestId('insightsTagContent-primary')).toHaveLength(
      0
    );
    expect(screen.getAllByTestId('insightsTagContent-default')).toHaveLength(3);
  });

  it('correctly calls addCategory', async () => {
    render(<Detect />);

    fireEvent.click(screen.getAllByTestId('insightsTagIconContainer')[0]);
    fireEvent.click(screen.getAllByTestId('insightsTagIconContainer')[1]);

    fireEvent.click(
      within(screen.getByTestId('insightsDetectButtonContainer')).getAllByRole(
        'button'
      )[0]
    );

    await waitFor(() => {
      expect(addInsightsCategory).toHaveBeenCalledTimes(2);
      expect(addInsightsCategory).toHaveBeenCalledWith(
        viewId,
        mockData.names[0]
      );
      expect(addInsightsCategory).toHaveBeenLastCalledWith(
        viewId,
        mockData.names[1]
      );
    });
  });
});
