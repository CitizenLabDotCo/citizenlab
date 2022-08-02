import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import PieChart from './';

jest.mock('services/appConfiguration');
jest.mock('utils/cl-intl');

describe('<PieChart />', () => {
  describe('Missing data', () => {
    it('renders empty state message if data is nil', () => {
      render(<PieChart emptyContainerContent={'No data available'} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders empty state message if data is Error', () => {
      render(
        <PieChart
          data={new Error()}
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
