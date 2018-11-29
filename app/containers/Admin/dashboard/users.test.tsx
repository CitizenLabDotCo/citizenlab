// libraries
import React from 'react';
import moment from 'moment';

// component to test
// ! it is the component without the HoCs (data, localization...)
import { UsersDashboard } from './users';

// mock data and functions to replace the HoCs
import { mockGetGroups } from 'services/__mocks__/groups';
import { localizeProps } from 'utils/testUtils/localizeProps';
import { shallowWithIntl } from 'utils/testUtils/withIntl';

// what needs to be mocked by jest to render the component
jest.mock('utils/cl-intl');

describe('<UsersDashboard />', () => {
  it('renders correctly', () => {
    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(<UsersDashboard groups={mockGetGroups} {...localizeProps} />);
    // the component sets endAtMoment to current time, but to match snapshots we need a stable date
    wrapper.setState({ endAtMoment: moment('2010-01-01T05:06:07', moment.ISO_8601) });
    expect(wrapper).toMatchSnapshot();
  });

  it('reacts to group changes', () => {
    const wrapper = shallowWithIntl(<UsersDashboard groups={{ ...mockGetGroups, groupsList: null }} {...localizeProps} />);
    let filters = wrapper.find('ChartFilters');
    // setting snapshots here is a disputable option -- cf code discussion
    expect(filters.prop('groupFilterOptions')).toMatchSnapshot();

    wrapper.setProps({ groups: mockGetGroups });

    // you can access the instance and read its props and state like this
    // don't abuse it -- cf code discussion
    // console.log(wrapper.instance().props);

    // you need to update the filter object to reflect the changes
    filters = wrapper.find('ChartFilters');
    expect(filters.prop('groupFilterOptions')).toMatchSnapshot()
  });
});
