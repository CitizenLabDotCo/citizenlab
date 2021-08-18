import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsViews';
import views from 'modules/commercial/insights/fixtures/views';

import InsightsList from './';

jest.mock('modules/commercial/insights/services/insightsViews', () => ({
  deleteInsightsView: jest.fn(),
}));

jest.mock('utils/cl-intl');

let mockData = views;

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
