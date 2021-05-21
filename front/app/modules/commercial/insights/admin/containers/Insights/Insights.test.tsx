import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import Insights from './';

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
      render(<Insights />);
      expect(screen.getByTestId('insightsList')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no data is available', () => {
      mockData = [];
      render(<Insights />);

      expect(screen.getByTestId('insightsListEmptyState')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
  });
});
