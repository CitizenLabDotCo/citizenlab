import React from 'react';
import { shallow } from 'enzyme';
jest.mock('utils/cl-intl');
jest.mock('services/stats');
jest.mock('services/appConfiguration');
jest.mock('components/Outlet', () => 'Outlet');

import { intl } from 'utils/cl-intl';
import { BarChartByCategory } from './BarChartByCategory';
import { chartTheme } from '../..';

const convertToGraphFormat = jest.fn();
const stream = jest.fn();
const serie = [
  {
    name: 'x',
    value: 1,
    code: 'x',
  },
  {
    name: 'y',
    value: 3,
    code: 'y',
  },
];

describe('<BarChartByCategory />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <BarChartByCategory
        serie={serie}
        startAt="04-12-2018"
        endAt="05-12-2018"
        currentGroupFilter={null}
        convertToGraphFormat={convertToGraphFormat}
        graphTitleString={''}
        stream={stream}
        graphUnit="users"
        customId={'test'}
        intl={intl}
        theme={chartTheme}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
