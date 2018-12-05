import React from 'react';
import { shallow } from 'enzyme';
jest.mock('utils/cl-intl');
jest.mock('services/stats');
import { intl } from 'utils/cl-intl';
import { CumulativeAreaChart } from './CumulativeAreaChart';
import { chartTheme } from '../..';

const stream = jest.fn();
const serie = [
  {
    name: 'x',
    value: 1,
    code: 'x'
  },
  {
    name: 'y',
    value: 3,
    code: 'y'
  }
];

describe('<CumulativeAreaChart />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <CumulativeAreaChart
        intl={intl}
        theme={chartTheme({})}
        serie={serie}
        graphTitleMessageKey="commentsByTimeTitle"
        graphUnit="comments"
        startAt={'05-12-2018'}
        endAt={'06-12-2018'}
        resolution={'day'}
        stream={stream}
        {...this.state}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
