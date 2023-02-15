import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import views from 'modules/commercial/insights/fixtures/views';

import InsightsList from './';

let mockData = { data: views };

jest.mock('modules/commercial/insights/api/views/useViews', () =>
  jest.fn(() => ({
    data: mockData,
  }))
);

const mockDeleteView = jest.fn();
jest.mock('modules/commercial/insights/api/views/useDeleteView', () =>
  jest.fn(() => ({
    mutate: mockDeleteView,
  }))
);

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

describe('Insights List', () => {
  describe('List', () => {
    it('renders list when data is available', () => {
      render(<InsightsList />);
      expect(screen.getByTestId('insightsList')).toBeInTheDocument();
    });
    it('renders correct number of list items', () => {
      render(<InsightsList />);
      expect(screen.getAllByTestId('insightsListItem')).toHaveLength(2);
    });
    it('opens create modal on button click', () => {
      render(<InsightsList />);
      fireEvent.click(screen.getByText('Create insights'));
      expect(screen.getByTestId('insightsCreateModal')).toBeInTheDocument();
    });
    it('deletes item on button click', () => {
      render(<InsightsList />);
      fireEvent.click(screen.getAllByText('Delete')[0]);
      expect(mockDeleteView).toHaveBeenCalledWith(mockData.data[0].id);
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no data is available', () => {
      mockData = { data: [] };
      render(<InsightsList />);
      expect(screen.getByTestId('insightsListEmptyState')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(1);
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });
    it('opens create modal on button click', () => {
      render(<InsightsList />);
      fireEvent.click(screen.getByText('Create my first insights'));
      expect(screen.getByTestId('insightsCreateModal')).toBeInTheDocument();
    });
  });
});
