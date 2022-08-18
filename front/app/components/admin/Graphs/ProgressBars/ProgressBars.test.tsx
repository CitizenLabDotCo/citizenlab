import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import ProgressBars from './';
import { NilOrError } from 'utils/helperUtils';

jest.mock('services/appConfiguration');
jest.mock('utils/cl-intl');

type Row = {
  name: string;
  label: string;
  value: number;
  total: number;
};

const data: Row[] = [
  { name: 'a', label: 'aaa', value: 1, total: 10 },
  { name: 'b', label: 'bbb', value: 2, total: 10 },
];

const getNilData = (): Row[] | NilOrError => null;
const getErrorData = (): Row[] | NilOrError => new Error();

describe('<ProgressBars />', () => {
  describe('Missing data', () => {
    it('renders empty state message if data is nil', () => {
      render(
        <ProgressBars
          data={getNilData()}
          mapping={{
            name: 'name',
            length: 'value',
            total: 'total',
          }}
          emptyContainerContent={'No data available'}
        />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders empty state message if data is Error', () => {
      render(
        <ProgressBars
          data={getErrorData()}
          mapping={{
            name: 'name',
            length: 'value',
            total: 'total',
          }}
          emptyContainerContent={'No data available'}
        />
      );
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });
  describe('With data', () => {
    it('renders correctly with non absolute data', () => {
      const { container } = render(
        <ProgressBars
          width={200}
          height={200}
          data={data}
          mapping={{
            name: 'name',
            length: 'value',
            total: 'total',
          }}
        />
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
        <ProgressBars
          width={200}
          height={200}
          data={data}
          mapping={{
            name: 'name',
            length: 'value',
            total: 'total',
          }}
        />
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
      const { debug } = render(
        <ProgressBars
          width={200}
          height={200}
          data={data}
          mapping={{
            name: 'label',
            length: 'value',
            total: 'total',
          }}
        />
      );

      debug();

      expect(screen.getByText('aaa')).toBeInTheDocument();
      expect(screen.getByText('bbb')).toBeInTheDocument();
    });
  });
});
