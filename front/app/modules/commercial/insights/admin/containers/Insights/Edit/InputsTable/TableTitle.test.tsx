import React from 'react';
import { render, screen, fireEvent, act, within } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsCategories';

import TableTitle from './TableTitle';

const mockData = [
  {
    id: '1aa8a788-3aee-4ada-a581-6d934e49784b',
    type: 'category',
    attributes: {
      name: 'Test',
    },
  },
  {
    id: '4b429681-1744-456f-8550-e89a2c2c74b2',
    type: 'category',
    attributes: {
      name: 'Test 2',
    },
  },
];

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
  deleteInsightsCategory: jest.fn(),
}));

jest.mock('modules/commercial/insights/hooks/useInsightsCategories', () => {
  return jest.fn(() => mockData);
});

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

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
  it('shows All Input title correctly', () => {
    render(<TableTitle />);
    expect(
      screen.getByTestId('insightsTableHeaderAllInput')
    ).toBeInTheDocument();
  });
  it('shows Not categorized title correctly', () => {
    mockLocationData = { pathname: '', query: { category: '' } };
    render(<TableTitle />);
    expect(
      screen.getByTestId('insightsTableHeaderNotCategorized')
    ).toBeInTheDocument();
  });
  it('shows Recently posted title correctly', () => {
    mockLocationData = { pathname: '', query: { processed: 'false' } };
    render(<TableTitle />);
    expect(
      screen.getByTestId('insightsTableHeaderRecentlyPosted')
    ).toBeInTheDocument();
  });
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
