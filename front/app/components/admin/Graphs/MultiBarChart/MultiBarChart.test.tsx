import React from 'react';
import { render, screen, waitFor } from 'utils/testUtils/rtl';
import MultiBarChart from './';
import { LabelList } from 'recharts';

jest.mock('services/appConfiguration');
jest.mock('utils/cl-intl');

describe('<MultiBarChart />', () => {
  describe('Missing data', () => {
    it('renders empty state message if data is nil', () => {
      render(
        <MultiBarChart
          mapping={{ length: [] }}
          emptyContainerContent={'No data available'}
        />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders empty state message if data is Error', () => {
      render(
        <MultiBarChart
          data={new Error()}
          mapping={{ length: [] }}
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

    // TODO
    it('renders correctly with correct mapping', () => {
      const { container } = render(
        <MultiBarChart
          width={200}
          height={250}
          data={data}
          mapping={{ length: ['value1', 'value2'] }}
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
          mapping={{ length: ['value1', 'value2'] }}
          bars={{ fill: ['red', 'blue'], isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(6);

      expect(bars[0]).toHaveAttribute('fill', 'red');
      expect(bars[1]).toHaveAttribute('fill', 'red');
      expect(bars[2]).toHaveAttribute('fill', 'red');
      expect(bars[3]).toHaveAttribute('fill', 'blue');
      expect(bars[4]).toHaveAttribute('fill', 'blue');
      expect(bars[5]).toHaveAttribute('fill', 'blue');
    });

    it('renders correctly with fill mapping', () => {
      const data = [
        { name: 'a', value1: 4, value2: 7, fill1: 'red', fill2: 'blue' },
        { name: 'b', value1: 10, value2: 4, fill1: 'blue', fill2: 'green' },
        { name: 'c', value1: 7, value2: 10, fill1: 'green', fill2: 'red' },
      ];

      const { container } = render(
        <MultiBarChart
          width={200}
          height={250}
          mapping={{
            length: ['value1', 'value2'],
            fill: ['fill1', 'fill2'],
          }}
          data={data}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(6);

      expect(bars[0]).toHaveAttribute('fill', 'red');
      expect(bars[1]).toHaveAttribute('fill', 'blue');
      expect(bars[2]).toHaveAttribute('fill', 'green');
      expect(bars[3]).toHaveAttribute('fill', 'blue');
      expect(bars[4]).toHaveAttribute('fill', 'green');
      expect(bars[5]).toHaveAttribute('fill', 'red');
    });

    it('renders correctly when fill mapping is function', () => {
      const { container } = render(
        <MultiBarChart
          width={200}
          height={250}
          mapping={{
            length: ['value1', 'value2'],
            fill: (row) =>
              row.name === 'a' ? ['red', 'blue'] : ['green', 'orange'],
          }}
          data={data}
          bars={{ isAnimationActive: false }}
        />
      );

      const bars = container.querySelectorAll('path');
      expect(bars).toHaveLength(6);

      expect(bars[0]).toHaveAttribute('fill', 'red');
      expect(bars[1]).toHaveAttribute('fill', 'green');
      expect(bars[2]).toHaveAttribute('fill', 'green');
      expect(bars[3]).toHaveAttribute('fill', 'blue');
      expect(bars[4]).toHaveAttribute('fill', 'orange');
      expect(bars[5]).toHaveAttribute('fill', 'orange');
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
          mapping={{ length: ['value1', 'value2'] }}
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

    it('does not render labels without providing renderLabels', () => {
      render(
        <MultiBarChart
          width={400}
          height={200}
          data={data}
          mapping={{ length: ['value1', 'value2'] }}
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
          mapping={{ length: ['value1', 'value2'] }}
          bars={{ isAnimationActive: false }}
          renderLabels={() => <LabelList />}
        />
      );

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('7.24')).toBeInTheDocument();
      await waitFor(() => expect(screen.getByText('6.49')).toBeInTheDocument());
    });
  });
});
