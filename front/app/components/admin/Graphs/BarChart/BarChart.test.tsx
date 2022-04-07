import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import BarChart from './';
import { LabelList } from 'recharts';

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

  const data = [
    { name: 'a', value: 4 },
    { name: 'b', value: 10 },
    { name: 'c', value: 7 },
  ];

  describe('With data', () => {
    const scale = (x) => 17.5 * x;
    const barHeights = [4, 10, 7].map((x) => scale(x).toString());

    it('renders correctly with default column names', () => {
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

      expect(bars[0]).toHaveAttribute('height', barHeights[0]);
      expect(bars[1]).toHaveAttribute('height', barHeights[1]);
      expect(bars[2]).toHaveAttribute('height', barHeights[2]);
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

      expect(bars[0]).toHaveAttribute('height', barHeights[0]);
      expect(bars[1]).toHaveAttribute('height', barHeights[1]);
      expect(bars[2]).toHaveAttribute('height', barHeights[2]);
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

  describe('Horizontal layout', () => {
    const scale = (x) => 27.5 * x;
    const barWidths = [4, 10, 7].map((x) => scale(x).toString());

    it('renders correctly', () => {
      const { container } = render(
        <BarChart
          width={400}
          height={200}
          data={data}
          bars={{ isAnimationActive: false }}
          layout="horizontal"
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(3);

      expect(bars[0]).toHaveAttribute('width', barWidths[0]);
      expect(bars[1]).toHaveAttribute('width', barWidths[1]);
      expect(bars[2]).toHaveAttribute('width', barWidths[2]);
    });
  });

  describe('Labels', () => {
    const data = [
      { name: 'a', value: 4 },
      { name: 'b', value: 7.24 },
      { name: 'c', value: 10 },
    ];

    it('does not render labels without providing renderLabels', () => {
      render(
        <BarChart
          width={400}
          height={200}
          data={data}
          bars={{ isAnimationActive: false }}
        />
      );

      expect(screen.queryByText('4')).not.toBeInTheDocument();
      expect(screen.queryByText('7.24')).not.toBeInTheDocument();
    });

    it('renders correctly with default column names', () => {
      render(
        <BarChart
          width={400}
          height={200}
          data={data}
          bars={{ isAnimationActive: false }}
          renderLabels={() => <LabelList />}
        />
      );

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('7.24')).toBeInTheDocument();
    });

    it('renders correctly with custom mapping', () => {
      render(
        <BarChart
          width={400}
          height={200}
          data={data}
          bars={{ isAnimationActive: false }}
          mapping={{ length: 'y' }}
          renderLabels={() => <LabelList />}
        />
      );

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('7.24')).toBeInTheDocument();
    });
  });
});
