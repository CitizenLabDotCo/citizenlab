import React from 'react';

import { NilOrError } from 'utils/helperUtils';
import { render, screen, waitFor } from 'utils/testUtils/rtl';

import PieChart from './';

type Row = { a: number; name: string };

const data: Row[] = [
  { a: 15, name: 'x' },
  { a: 5, name: 'y' },
];

const getNilData = (): Row[] | NilOrError => null;
const getErrorData = (): Row[] | NilOrError => new Error();
const getData = (): Row[] | NilOrError => data;

describe('<PieChart />', () => {
  describe('Missing data', () => {
    it('renders empty state message if data is nil', () => {
      render(
        <PieChart
          data={getNilData()}
          mapping={{ angle: 'a', name: 'name' }}
          emptyContainerContent={'No data available'}
        />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders empty state message if data is Error', () => {
      render(
        <PieChart
          data={getErrorData()}
          mapping={{ angle: 'a', name: 'name' }}
          emptyContainerContent={'No data available'}
        />
      );
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('With data', () => {
    it('renders correctly data', () => {
      const { container } = render(
        <PieChart
          width={200}
          height={200}
          data={getData()}
          mapping={{ angle: 'a', name: 'name' }}
          pie={{ isAnimationActive: false }}
        />
      );

      const pathSectors = container.querySelectorAll(
        '.recharts-pie-sector > path'
      );
      expect(pathSectors).toHaveLength(2);
    });

    it('uses default color scheme if no fill mapping is used', () => {
      const { container } = render(
        <PieChart
          width={200}
          height={200}
          data={getData()}
          mapping={{ angle: 'a', name: 'name' }}
          pie={{ isAnimationActive: false }}
        />
      );

      const pathSectors = container.querySelectorAll(
        '.recharts-pie-sector > path'
      );
      expect(pathSectors[0]).toHaveAttribute('fill', '#2F478A');
      expect(pathSectors[1]).toHaveAttribute('fill', '#4D85C6');
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
        <PieChart
          width={400}
          height={200}
          data={data}
          mapping={{ angle: 'a', name: 'name' }}
          pie={{ isAnimationActive: false }}
          legend={{ items: legendItems }}
        />
      );

      const items = container.querySelectorAll('.graph-legend-item');
      waitFor(() => {
        expect(items).toHaveLength(3);
      });
    });
  });
});
