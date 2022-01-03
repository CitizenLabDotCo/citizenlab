// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { NotificationMenu } from './';
import { GetAuthUserChildProps } from 'resources/GetAuthUser';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('utils/analytics', () => ({ trackEventByName: () => {} }));

import { makeUser } from 'services/__mocks__/users';
jest.mock('modules', () => ({ streamsToReset: [] }));

const mockUserFromResource: GetAuthUserChildProps = makeUser({
  unread_notifications: 0,
}).data;

describe('<NotificationMenu />', () => {
  it('renders correctly when a user is logged in', () => {
    const wrapper = shallow(
      <NotificationMenu authUser={mockUserFromResource} />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when there no user is logged in', () => {
    const wrapper = shallow(<NotificationMenu authUser={undefined} />);
    expect(wrapper).toMatchSnapshot();
  });
});
