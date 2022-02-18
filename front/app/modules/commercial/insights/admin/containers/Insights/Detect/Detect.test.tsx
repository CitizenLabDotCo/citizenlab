import React from 'react';
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from 'utils/testUtils/rtl';
import { addInsightsCategory } from 'modules/commercial/insights/services/insightsCategories';
import categories from 'modules/commercial/insights/fixtures/categories';

import Detect from './';

let mockData = categories;
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
jest.mock('modules');

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
    expect(screen.getAllByTestId('insightsTag')).toHaveLength(mockData.length);
    expect(screen.getAllByTestId('insightsTagContent-default')).toHaveLength(
      mockData.length
    );
  });

  it('selects and deselects categories correctly', () => {
    render(<Detect />);
    fireEvent.click(screen.getAllByTestId('insightsTagIconContainer')[0]);
    fireEvent.click(screen.getAllByTestId('insightsTagIconContainer')[1]);

    expect(screen.getAllByTestId('insightsTagContent-primary')).toHaveLength(2);
    expect(screen.getAllByTestId('insightsTagContent-default')).toHaveLength(
      mockData.length - 2
    );

    fireEvent.click(screen.getAllByTestId('insightsTagIconContainer')[0]);
    fireEvent.click(screen.getAllByTestId('insightsTagIconContainer')[1]);

    expect(screen.queryAllByTestId('insightsTagContent-primary')).toHaveLength(
      0
    );
    expect(screen.getAllByTestId('insightsTagContent-default')).toHaveLength(
      mockData.length
    );
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
      expect(addInsightsCategory).toHaveBeenCalledWith({
        insightsViewId: viewId,
        name: mockData[0].attributes.name,
      });
      expect(addInsightsCategory).toHaveBeenLastCalledWith({
        insightsViewId: viewId,
        name: mockData[1].attributes.name,
      });
    });
  });
  it('shows empty description when no data', () => {
    mockData = [];
    render(<Detect />);
    expect(
      screen.getByTestId('insightsDetectEmptyDescription')
    ).toBeInTheDocument();
  });
});
