import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsViews';

import InsightsList from './';

jest.mock('modules/commercial/insights/services/insightsViews', () => ({
  deleteInsightsView: jest.fn(),
}));

jest.mock('utils/cl-intl');

let mockData = [
  {
    id: '1aa8a788-3aee-4ada-a581-6d934e49784b',
    type: 'view',
    attributes: {
      name: 'Test',
      updated_at: '2021-05-18T16:07:27.123Z',
    },
  },
  {
    id: '4b429681-1744-456f-8550-e89a2c2c74b2',
    type: 'view',
    attributes: {
      name: 'Test 2',
      updated_at: '2021-05-18T16:07:49.156Z',
    },
  },
];

jest.mock('modules/commercial/insights/hooks/useInsightsViews', () => {
  return jest.fn(() => mockData);
});

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
      const spy = jest.spyOn(service, 'deleteInsightsView');
      render(<InsightsList />);
      fireEvent.click(screen.getAllByText('Delete')[0]);
      expect(spy).toHaveBeenCalledWith(mockData[0].id);
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no data is available', () => {
      mockData = [];
      render(<InsightsList />);
      expect(screen.getByTestId('insightsListEmptyState')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
    it('opens create modal on button click', () => {
      render(<InsightsList />);
      fireEvent.click(screen.getByText('Create my first insights'));
      expect(screen.getByTestId('insightsCreateModal')).toBeInTheDocument();
    });
  });
});
