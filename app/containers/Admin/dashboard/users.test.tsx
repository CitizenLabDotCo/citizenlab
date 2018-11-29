import React from 'react';
import moment from 'moment';
jest.mock('utils/cl-intl');
import { UsersDashboard } from './users';
import { mockGetGroups } from 'services/__mocks__/groups';
import { localizeProps } from 'utils/testUtils/localizeProps';

import { shallowWithIntl } from 'utils/testUtils/withIntl';

describe('<UsersDashboard />', () => {
  it('renders correctly', () => {
    const wrapper = shallowWithIntl(<UsersDashboard groups={mockGetGroups} {...localizeProps} />);
    wrapper.setState({ endAtMoment: moment('2010-01-01T05:06:07', moment.ISO_8601) });
    expect(wrapper).toMatchSnapshot();
  });

  it('reacts to group changes', () => {
    const wrapper = shallowWithIntl(<UsersDashboard groups={{ ...mockGetGroups, groupsList: null }} {...localizeProps} />);
    let filters = wrapper.find('ChartFilters');
    // setting snapshots here in case we need a more complete mockGetGroups object at some point
    expect(filters.prop('groupFilterOptions')).toMatchSnapshot();

    wrapper.setProps({ groups: mockGetGroups });
    // console.log(wrapper.instance().props);

    // you need to update the filter object to reflect the changes
    filters = wrapper.find('ChartFilters');
    expect(filters.prop('groupFilterOptions')).toMatchSnapshot()
  });
});
