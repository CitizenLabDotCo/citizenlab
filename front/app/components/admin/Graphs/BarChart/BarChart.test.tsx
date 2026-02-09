import React from 'react';

import { NilOrError } from 'utils/helperUtils';
import { render, screen } from 'utils/testUtils/rtl';

import { legacyColors } from '../styling';

import BarChart from './';

type Row = { name: string; value: number };

const getEmptyData = (): Row[] | NilOrError => null;
const getErrorData = (): Row[] | NilOrError => new Error();
const emptyData = getEmptyData();
const errorData = getErrorData();

describe('<BarChart />', () => {
  describe('Missing data', () => {
    it('renders empty state message if data is nil', () => {
      render(
        <BarChart
          data={emptyData}
          mapping={{ category: 'name', length: 'value' }}
          emptyContainerContent={'No data available'}
        />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders empty state message if data is Error', () => {
      render(
        <BarChart
          data={errorData}
          mapping={{ category: 'name', length: 'value' }}
          emptyContainerContent={'No data available'}
        />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  const data: Row[] = [
    { name: 'a', value: 4 },
    { name: 'b', value: 10 },
    { name: 'c', value: 7 },
  ];

  describe('With data', () => {
    const scale = (x) => 17.5 * x;
    const barHeights = [4, 10, 7].map((x) => scale(x).toString());

    it('renders correctly', () => {
      const { container } = render(
        <BarChart
          width={200}
          height={250}
          data={data}
          mapping={{ category: 'name', length: 'value' }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(3);

      expect(bars[0]).toHaveAttribute('height', barHeights[0]);
      expect(bars[1]).toHaveAttribute('height', barHeights[1]);
      expect(bars[2]).toHaveAttribute('height', barHeights[2]);
    });

    it('renders correctly with fixed fill', () => {
      const { container } = render(
        <BarChart
          width={200}
          height={250}
          data={data}
          mapping={{
            category: 'name',
            length: 'value',
            fill: () => legacyColors.pinkRed,
          }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(3);

      expect(bars[0]).toHaveAttribute('fill', legacyColors.pinkRed);
      expect(bars[1]).toHaveAttribute('fill', legacyColors.pinkRed);
      expect(bars[2]).toHaveAttribute('fill', legacyColors.pinkRed);
    });

    it('renders correctly with fill mapping', () => {
      const data = [
        { name: 'a', value: 4, color: 'red' },
        { name: 'b', value: 10, color: 'blue' },
        { name: 'c', value: 7, color: 'green' },
      ];

      const colorMapping = {
        red: legacyColors.pinkRed,
        blue: legacyColors.lightBlue,
        green: legacyColors.lightGreen,
      };

      const { container } = render(
        <BarChart
          width={200}
          height={250}
          data={data}
          mapping={{
            category: 'name',
            length: 'value',
            fill: ({ row: { color } }) => colorMapping[color],
          }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(3);

      expect(bars[0]).toHaveAttribute('fill', legacyColors.pinkRed);
      expect(bars[1]).toHaveAttribute('fill', legacyColors.lightBlue);
      expect(bars[2]).toHaveAttribute('fill', legacyColors.lightGreen);
    });

    it('has correct fallback fill when no fill is provided', () => {
      const { container } = render(
        <BarChart
          width={200}
          height={250}
          data={data}
          mapping={{
            category: 'name',
            length: 'value',
          }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(3);

      expect(bars[0]).toHaveAttribute('fill', legacyColors.barFill);
      expect(bars[1]).toHaveAttribute('fill', legacyColors.barFill);
      expect(bars[2]).toHaveAttribute('fill', legacyColors.barFill);
    });

    it('renders correctly with fixed opacities', () => {
      const { container } = render(
        <BarChart
          width={200}
          height={250}
          data={data}
          mapping={{
            category: 'name',
            length: 'value',
            opacity: () => 0.7,
          }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(3);

      expect(bars[0]).toHaveAttribute('opacity', '0.7');
      expect(bars[1]).toHaveAttribute('opacity', '0.7');
      expect(bars[2]).toHaveAttribute('opacity', '0.7');
    });

    it('renders correctly with opacity mapping', () => {
      const data = [
        { name: 'a', value: 4, opacity: 1 },
        { name: 'b', value: 10, opacity: 0.4 },
        { name: 'c', value: 7, opacity: 0.7 },
      ];

      const { container } = render(
        <BarChart
          width={200}
          height={250}
          data={data}
          mapping={{
            category: 'name',
            length: 'value',
            opacity: ({ row: { opacity } }) => opacity,
          }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(3);

      expect(bars[0]).toHaveAttribute('opacity', '1');
      expect(bars[1]).toHaveAttribute('opacity', '0.4');
      expect(bars[2]).toHaveAttribute('opacity', '0.7');
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
          mapping={{ category: 'name', length: 'value' }}
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
    const data: Row[] = [
      { name: 'a', value: 4 },
      { name: 'b', value: 7.24 },
      { name: 'c', value: 10 },
    ];

    it('does not render labels without providing labels', () => {
      render(
        <BarChart
          width={400}
          height={200}
          data={data}
          mapping={{ category: 'name', length: 'value' }}
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
          mapping={{ category: 'name', length: 'value' }}
          bars={{ isAnimationActive: false }}
          labels
        />
      );

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('7.24')).toBeInTheDocument();
    });
  });
});
