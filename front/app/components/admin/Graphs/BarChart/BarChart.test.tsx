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

    it('renders empty state message if data is Error', () => {
      render(<BarChart data={new Error()} />);
      expect(
        screen.getByText('No data available with the current filters.')
      ).toBeInTheDocument();
    });
  });

  describe('With data', () => {
    const BAR_HEIGHTS = ['70', '175', '122.5'];

    it('renders correctly with default column names', () => {
      const data = [
        { name: 'a', value: 4 },
        { name: 'b', value: 10 },
        { name: 'c', value: 7 },
      ];

      const { container } = render(
        <BarChart
          width={200}
          height={250}
          data={data}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(3);

      expect(bars[0]).toHaveAttribute('height', BAR_HEIGHTS[0]);
      expect(bars[1]).toHaveAttribute('height', BAR_HEIGHTS[1]);
      expect(bars[2]).toHaveAttribute('height', BAR_HEIGHTS[2]);
    });

    it('renders correctly with custom length mapping', () => {
      const data = [
        { name: 'a', y: 4 },
        { name: 'b', y: 10 },
        { name: 'c', y: 7 },
      ];

      const { container } = render(
        <BarChart
          width={200}
          height={250}
          data={data}
          mapping={{ length: 'y' }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(3);

      expect(bars[0]).toHaveAttribute('height', BAR_HEIGHTS[0]);
      expect(bars[1]).toHaveAttribute('height', BAR_HEIGHTS[1]);
      expect(bars[2]).toHaveAttribute('height', BAR_HEIGHTS[2]);
    });

    it('renders correctly with fill mapping', () => {
      const data = [
        { name: 'a', value: 4, color: 'red' },
        { name: 'b', value: 10, color: 'blue' },
        { name: 'c', value: 7, color: 'green' },
      ];

      const { container } = render(
        <BarChart
          width={200}
          height={250}
          data={data}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(3);

      expect(bars[0]).toHaveAttribute('color', 'red');
      expect(bars[1]).toHaveAttribute('color', 'blue');
      expect(bars[2]).toHaveAttribute('color', 'green');
    });
  });
});
