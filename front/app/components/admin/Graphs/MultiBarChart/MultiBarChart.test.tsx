import React from 'react';

import { NilOrError } from 'utils/helperUtils';
import { render, screen, waitFor } from 'utils/testUtils/rtl';

import { legacyColors } from '../styling';

import MultiBarChart from './';

type Row = { name: string; value1: number; value2: number };

const getEmptyData = (): Row[] | NilOrError => null;
const getErrorData = (): Row[] | NilOrError => new Error();
const emptyData = getEmptyData();
const errorData = getErrorData();

describe('<MultiBarChart />', () => {
  describe('Missing data', () => {
    it('renders empty state message if data is nil', () => {
      render(
        <MultiBarChart
          data={emptyData}
          mapping={{ category: 'name', length: ['value1', 'value2'] }}
          emptyContainerContent={'No data available'}
        />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders empty state message if data is Error', () => {
      render(
        <MultiBarChart
          data={errorData}
          mapping={{ category: 'name', length: ['value1', 'value2'] }}
          emptyContainerContent={'No data available'}
        />
      );
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  const data = [
    { name: 'a', value1: 4, value2: 7 },
    { name: 'b', value1: 10, value2: 4 },
    { name: 'c', value1: 7, value2: 10 },
  ];

  describe('With data', () => {
    const scale = (x) => 17.5 * x;
    const barHeights = [4, 10, 7].map((x) => scale(x).toString());

    it('renders correctly with correct mapping', () => {
      const { container } = render(
        <MultiBarChart
          width={200}
          height={250}
          data={data}
          mapping={{ category: 'name', length: ['value1', 'value2'] }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(6);

      // value1
      expect(bars[0]).toHaveAttribute('height', barHeights[0]);
      expect(bars[1]).toHaveAttribute('height', barHeights[1]);
      expect(bars[2]).toHaveAttribute('height', barHeights[2]);

      // value2
      expect(bars[3]).toHaveAttribute('height', barHeights[2]);
      expect(bars[4]).toHaveAttribute('height', barHeights[0]);
      expect(bars[5]).toHaveAttribute('height', barHeights[1]);
    });

    it('renders correctly with fixed fills', () => {
      const { container } = render(
        <MultiBarChart
          width={200}
          height={250}
          data={data}
          mapping={{
            category: 'name',
            length: ['value1', 'value2'],
            fill: ({ barIndex }) =>
              [legacyColors.lightBlue, legacyColors.pinkRed][barIndex],
          }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(6);

      expect(bars[0]).toHaveAttribute('fill', legacyColors.lightBlue);
      expect(bars[1]).toHaveAttribute('fill', legacyColors.lightBlue);
      expect(bars[2]).toHaveAttribute('fill', legacyColors.lightBlue);
      expect(bars[3]).toHaveAttribute('fill', legacyColors.pinkRed);
      expect(bars[4]).toHaveAttribute('fill', legacyColors.pinkRed);
      expect(bars[5]).toHaveAttribute('fill', legacyColors.pinkRed);
    });

    it('renders correctly with fill mapping', () => {
      interface Row2 extends Row {
        fill1: string;
        fill2: string;
      }

      const data: Row2[] = [
        { name: 'a', value1: 4, value2: 7, fill1: 'red', fill2: 'blue' },
        { name: 'b', value1: 10, value2: 4, fill1: 'blue', fill2: 'green' },
        { name: 'c', value1: 7, value2: 10, fill1: 'green', fill2: 'red' },
      ];

      const colorMapping = {
        red: legacyColors.pinkRed,
        blue: legacyColors.lightBlue,
        green: legacyColors.lightGreen,
      };

      const { container } = render(
        <MultiBarChart
          width={200}
          height={250}
          data={data}
          mapping={{
            category: 'name',
            length: ['value1', 'value2'],
            fill: ({ row: { fill1, fill2 }, barIndex }) =>
              [colorMapping[fill1], colorMapping[fill2]][barIndex],
          }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(6);

      expect(bars[0]).toHaveAttribute('fill', legacyColors.pinkRed);
      expect(bars[1]).toHaveAttribute('fill', legacyColors.lightBlue);
      expect(bars[2]).toHaveAttribute('fill', legacyColors.lightGreen);
      expect(bars[3]).toHaveAttribute('fill', legacyColors.lightBlue);
      expect(bars[4]).toHaveAttribute('fill', legacyColors.lightGreen);
      expect(bars[5]).toHaveAttribute('fill', legacyColors.pinkRed);
    });

    it('renders correctly with fixed opacities', () => {
      const { container } = render(
        <MultiBarChart
          width={200}
          height={250}
          data={data}
          mapping={{
            category: 'name',
            length: ['value1', 'value2'],
            opacity: () => 0.8,
          }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(6);

      expect(bars[0]).toHaveAttribute('opacity', '0.8');
      expect(bars[1]).toHaveAttribute('opacity', '0.8');
      expect(bars[2]).toHaveAttribute('opacity', '0.8');
      expect(bars[3]).toHaveAttribute('opacity', '0.8');
      expect(bars[4]).toHaveAttribute('opacity', '0.8');
      expect(bars[5]).toHaveAttribute('opacity', '0.8');
    });

    it('renders correctly with opacity mapping', () => {
      interface Row3 extends Row {
        opacity1: number;
        opacity2: number;
      }

      const data: Row3[] = [
        { name: 'a', value1: 4, value2: 7, opacity1: 1, opacity2: 0.8 },
        { name: 'b', value1: 10, value2: 4, opacity1: 0.5, opacity2: 0.3 },
        { name: 'c', value1: 7, value2: 10, opacity1: 0.7, opacity2: 0.4 },
      ];

      const { container } = render(
        <MultiBarChart
          width={200}
          height={250}
          data={data}
          mapping={{
            category: 'name',
            length: ['value1', 'value2'],
            opacity: ({ row: { opacity1, opacity2 }, barIndex }) =>
              [opacity1, opacity2][barIndex],
          }}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(6);

      expect(bars[0]).toHaveAttribute('opacity', '1');
      expect(bars[1]).toHaveAttribute('opacity', '0.5');
      expect(bars[2]).toHaveAttribute('opacity', '0.7');
      expect(bars[3]).toHaveAttribute('opacity', '0.8');
      expect(bars[4]).toHaveAttribute('opacity', '0.3');
      expect(bars[5]).toHaveAttribute('opacity', '0.4');
    });
  });

  describe('Horizontal layout', () => {
    const scale = (x) => 27.5 * x;
    const barWidths = [4, 10, 7].map((x) => scale(x).toString());

    it('renders correctly', () => {
      const { container } = render(
        <MultiBarChart
          width={400}
          height={200}
          data={data}
          mapping={{ category: 'name', length: ['value1', 'value2'] }}
          bars={{ isAnimationActive: false }}
          layout="horizontal"
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(6);

      // value1
      expect(bars[0]).toHaveAttribute('width', barWidths[0]);
      expect(bars[1]).toHaveAttribute('width', barWidths[1]);
      expect(bars[2]).toHaveAttribute('width', barWidths[2]);

      // value2
      expect(bars[3]).toHaveAttribute('width', barWidths[2]);
      expect(bars[4]).toHaveAttribute('width', barWidths[0]);
      expect(bars[5]).toHaveAttribute('width', barWidths[1]);
    });
  });

  describe('Labels', () => {
    const data = [
      { name: 'a', value1: 4, value2: 6.49 },
      { name: 'b', value1: 7.24, value2: 8 },
      { name: 'c', value1: 10, value2: 9.31 },
    ];

    it('does not render labels without providing labels', () => {
      render(
        <MultiBarChart
          width={400}
          height={200}
          data={data}
          mapping={{ category: 'name', length: ['value1', 'value2'] }}
          bars={{ isAnimationActive: false }}
        />
      );

      expect(screen.queryByText('4')).not.toBeInTheDocument();
      expect(screen.queryByText('7.24')).not.toBeInTheDocument();
      expect(screen.queryByText('6.49')).not.toBeInTheDocument();
    });

    it('renders correctly with correct mapping', async () => {
      render(
        <MultiBarChart
          width={400}
          height={200}
          data={data}
          mapping={{ category: 'name', length: ['value1', 'value2'] }}
          bars={{ isAnimationActive: false }}
          labels
        />
      );

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('7.24')).toBeInTheDocument();
      await waitFor(() => expect(screen.getByText('6.49')).toBeInTheDocument());
    });
  });

  describe('Legend', () => {
    const legendItems: any = [
      { icon: 'circle', label: 'item1', color: 'red' },
      { icon: 'circle', label: 'item2', color: 'blue' },
      { icon: 'circle', label: 'item3', color: 'blue' },
    ];

    it('renders legend', async () => {
      const { container } = render(
        <MultiBarChart
          width={400}
          height={200}
          data={data}
          mapping={{ category: 'name', length: ['value1', 'value2'] }}
          bars={{ isAnimationActive: false }}
          legend={{ items: legendItems }}
        />
      );

      const items = container.querySelectorAll('.graph-legend-item');
      waitFor(() => {
        expect(items).toHaveLength(3);
      });
    });

    it("doesn't throw error when rerendering with more items", () => {
      const { rerender } = render(
        <MultiBarChart
          width={400}
          height={200}
          data={data}
          mapping={{ category: 'name', length: ['value1', 'value2'] }}
          bars={{ isAnimationActive: false }}
          legend={{ items: legendItems.slice(0, 2) }}
        />
      );

      rerender(
        <MultiBarChart
          width={400}
          height={200}
          data={data}
          mapping={{ category: 'name', length: ['value1', 'value2'] }}
          bars={{ isAnimationActive: false }}
          legend={{ items: legendItems }}
        />
      );
    });
  });
});
