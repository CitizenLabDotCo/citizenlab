// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import NotificationsDropdown from './NotificationsDropdown';
import { GetNotificationsChildProps } from 'resources/GetNotifications';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('utils/analytics', () => ({ trackEventByName: () => {} }));

import { getNotification } from 'services/__mocks__/notifications';
jest.mock('modules', () => ({ streamsToReset: [] }));

const onLoadMore = jest.fn();
const mockNotificationsFromResourceComp: GetNotificationsChildProps = {
  onLoadMore,
  list: [getNotification('aminRights', 'admin_rights_received')],
  hasMore: false,
};
const dropdownOpened = true;

describe('<NotificationMenu />', () => {
  it('renders correctly when everything is there', () => {
    const wrapper = shallow(
      <NotificationsDropdown
        dropdownOpened={dropdownOpened}
        toggleDropdown={() => {}}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when there is no user', () => {
    const wrapper = shallow(
      <NotificationsDropdown
        dropdownOpened={dropdownOpened}
        toggleDropdown={() => {}}
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
      <NotificationsDropdown
        dropdownOpened={dropdownOpened}
        toggleDropdown={() => {}}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
