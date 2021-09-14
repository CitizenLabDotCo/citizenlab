// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { NotificationMenu } from './';
import { GetNotificationsChildProps } from 'resources/GetNotifications';
import { GetAuthUserChildProps } from 'resources/GetAuthUser';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('utils/analytics', () => ({ trackEventByName: () => {} }));

import { getNotification } from 'services/__mocks__/notifications';
import { makeUser } from 'services/__mocks__/users';
jest.mock('modules', () => ({ streamsToReset: [] }));

const onLoadMore = jest.fn();
const mockNotificationsFromResourceComp: GetNotificationsChildProps = {
  onLoadMore,
  list: [getNotification('aminRights', 'admin_rights_received')],
  hasMore: false,
};
const mockUserFromResource: GetAuthUserChildProps = makeUser({
  unread_notifications: 0,
}).data;

describe('<NotificationMenu />', () => {
  it('renders correctly when everything is there', () => {
    const wrapper = shallow(
      <NotificationMenu
        notifications={mockNotificationsFromResourceComp}
        authUser={mockUserFromResource}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when there is no user', () => {
    const wrapper = shallow(
      <NotificationMenu
        notifications={mockNotificationsFromResourceComp}
        authUser={undefined}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when there is no notifs', () => {
    const noNotifs = {
      onLoadMore,
      list: null,
      hasMore: false,
    };
    const wrapper = shallow(
      <NotificationMenu
        notifications={noNotifs}
        authUser={mockUserFromResource}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
