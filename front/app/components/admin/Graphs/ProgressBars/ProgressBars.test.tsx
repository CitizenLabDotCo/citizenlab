import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import ProgressBars from './';

jest.mock('services/appConfiguration');
jest.mock('utils/cl-intl');

describe('<ProgressBars />', () => {
  describe('Missing data', () => {
    it('renders empty state message if data is nil', () => {
      render(<ProgressBars emptyContainerContent={'No data available'} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders empty state message if data is Error', () => {
      render(
        <ProgressBars
          data={new Error()}
          emptyContainerContent={'No data available'}
        />
      );
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('With data', () => {
    it('renders correctly with non absolute data', () => {
      const data = [
        { name: 'a', label: 'aaa', value: 1, total: 10 },
        { name: 'b', label: 'bbb', value: 2, total: 10 },
      ];
      const { container } = render(
        <ProgressBars data={data} width={200} height={200} />
      );

      const pathBars = container.querySelectorAll(
        '.recharts-bar-rectangle > path'
      );
      expect(pathBars).toHaveLength(4);

      const rectBars = container.querySelectorAll(
        '.recharts-bar-rectangle > rect'
      );
      expect(rectBars).toHaveLength(0);
    });

    it('renders correctly with absolute data', () => {
      const data = [
        { name: 'a', label: 'aaa', value: 0, total: 10 },
        { name: 'b', label: 'bbb', value: 10, total: 10 },
      ];
      const { container } = render(
        <ProgressBars data={data} width={200} height={200} />
      );

      const pathBars = container.querySelectorAll(
        '.recharts-bar-rectangle > path'
      );
      expect(pathBars).toHaveLength(0);

      const rectBars = container.querySelectorAll(
        '.recharts-bar-rectangle > rect'
      );
      expect(rectBars).toHaveLength(4);
    });

    it('renders correctly with labels', () => {
      const data = [
        { name: 'a', label: 'aaa', value: 0, total: 10 },
        { name: 'b', label: 'bbb', value: 10, total: 10 },
      ];
      render(<ProgressBars data={data} width={200} height={200} />);

      expect(screen.queryByText('aaa')).toBeInTheDocument();
      expect(screen.queryByText('bbb')).toBeInTheDocument();
    });
  });
});
