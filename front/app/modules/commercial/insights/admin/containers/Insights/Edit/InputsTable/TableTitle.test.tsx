import React from 'react';
import { render, screen, fireEvent, act, within } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsCategories';
import categories from 'modules/commercial/insights/fixtures/categories';

import TableTitle from './TableTitle';

const mockData = categories;

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
  deleteInsightsCategory: jest.fn(),
}));

jest.mock('modules/commercial/insights/hooks/useInsightsCategories', () => {
  return jest.fn(() => mockData);
});

jest.mock('hooks/useLocale');

const viewId = '1';

let mockLocationData = { pathname: '', query: {} };

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
  };
});

describe('Table Title', () => {
  it('shows selected category correctly', () => {
    mockLocationData = { pathname: '', query: { category: mockData[0].id } };
    render(<TableTitle />);
    expect(
      within(screen.getByTestId('insightsInputsHeader')).getByText(
        mockData[0].attributes.name
      )
    ).toBeInTheDocument();
  });

  it('deletes category correctly', async () => {
    mockLocationData = { pathname: '', query: { category: mockData[0].id } };
    render(<TableTitle />);
    fireEvent.click(
      within(screen.getByTestId('insightsInputsHeader')).getByRole('button')
    );
    await act(async () => {
      fireEvent.click(screen.getByText('Delete category'));
    });
    expect(service.deleteInsightsCategory).toHaveBeenCalledWith(
      viewId,
      mockData[0].id
    );
  });
});
