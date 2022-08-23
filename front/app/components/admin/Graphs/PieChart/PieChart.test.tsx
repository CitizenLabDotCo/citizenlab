import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import PieChart from './';
import { NilOrError } from 'utils/helperUtils';

jest.mock('services/appConfiguration');
jest.mock('utils/cl-intl');

type Row = { a: number; name: string };

// const data: Row[] = [
//   { a: 10, name: 'x' },
//   { a: 5, name: 'y' },
// ];

const getNilData = (): Row[] | NilOrError => null;
const getErrorData = (): Row[] | NilOrError => new Error();
// const getData = (): Row[] | NilOrError => data;

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

  // describe('With data', () => {
  //   it('renders correctly with non absolute data', () => {
  //     const data = [
  //       { name: 'a', color: '#000', value: 1 },
  //       { name: 'b', color: '#000', value: 2 }
  //     ];
  //     const { container } = render(
  //       <PieChart data={data} width={200} height={200} />
  //     );

  //     const pathSectors = container.querySelectorAll('.recharts-pie-sector > path');
  //     expect(pathSectors).toHaveLength(3);
  //   });
  // });
});
