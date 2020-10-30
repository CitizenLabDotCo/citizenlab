// libraries
import React from 'react';
import { shallowWithIntl } from 'utils/testUtils/withIntl';

// component to test
import { UsersShowPage } from './';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('services/comments');
jest.mock('services/ideas');
jest.mock('services/users');

const mockScroll = jest.fn();
global.scrollTo = mockScroll;

import { makeUser } from 'services/__mocks__/users';

describe('<UsersShowPage />', () => {
  it('renders correctly by default', () => {
    const wrapper = shallowWithIntl(<UsersShowPage user={makeUser().data} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly on the other tab', () => {
    const wrapper = shallowWithIntl(<UsersShowPage user={makeUser().data} />);
    wrapper.find('WrappedUserNavbar').prop('selectTab')('comments')();
    wrapper.update();
    expect(mockScroll).toHaveBeenCalledWith(0, 0);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly with an erroneous user', () => {
    const wrapper = shallowWithIntl(<UsersShowPage user={new Error()} />);

    expect(wrapper).toMatchSnapshot();
  });
});
