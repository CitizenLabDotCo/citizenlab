import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import BarChart from './';

jest.mock('services/appConfiguration');
jest.mock('utils/cl-intl');

describe('<BarChart />', () => {
  describe('Missing data', () => {
    it('renders empty state message if data is nil', () => {
      render(<BarChart />);
      expect(
        screen.getByText('No data available with the current filters.')
      ).toBeInTheDocument();
    });
  });
});
