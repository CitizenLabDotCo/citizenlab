import React from 'react';
import { shallow } from 'enzyme';
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('components/Outlet', () => 'Outlet');
import { intl } from 'utils/cl-intl';
import { CumulativeAreaChart } from './CumulativeAreaChart';
import {
  usersByTimeCumulativeStream,
  __setMockUsersByTimeCumulativeStream,
  mockUsersByTimeCumulative,
} from 'services/__mocks__/stats';
import { chartTheme } from '../..';

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

describe('<CumulativeAreaChart />', () => {
  it('renders correctly without data', () => {
    const wrapper = shallow(
      <CumulativeAreaChart
        intl={intl}
        theme={chartTheme({})}
        graphTitle="commentsByTimeTitle"
        graphUnit="comments"
        startAt={'05-12-2018'}
        endAt={'06-12-2018'}
        currentProjectFilter={null}
        currentGroupFilter={null}
        currentTopicFilter={null}
        resolution={'day'}
        stream={usersByTimeCumulativeStream}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly with data', () => {
    const wrapper = shallow(
      <CumulativeAreaChart
        intl={intl}
        theme={chartTheme({})}
        graphTitle="commentsByTimeTitle"
        graphUnit="comments"
        startAt={'05-12-2018'}
        endAt={'06-12-2018'}
        currentProjectFilter={null}
        currentGroupFilter={null}
        currentTopicFilter={null}
        resolution={'day'}
        stream={usersByTimeCumulativeStream}
      />
    );
    __setMockUsersByTimeCumulativeStream(mockUsersByTimeCumulative);
    expect(wrapper).toMatchSnapshot();
  });
});
