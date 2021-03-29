// libraries
import React from 'react';
import { shallow } from 'enzyme';
import { intl } from 'utils/cl-intl';
import useUser from 'hooks/useUser';

// component to test
import { UsersShowPage } from './';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('services/comments');
jest.mock('services/ideas');
jest.mock('services/users');

const mockScroll = jest.fn();
global.scrollTo = mockScroll;

const user = makeUser().data;
jest.mock('hooks/useUser', () => jest.fn());

import { makeUser } from 'services/__mocks__/users';

describe('<UsersShowPage />', () => {
  it('renders correctly by default', () => {
    useUser.mockImplementation(() => user);
    const wrapper = shallow(
      <UsersShowPage params={{ slug: user.attributes.slug }} intl={intl} />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly on the other tab', () => {
    useUser.mockImplementation(() => user);
    const wrapper = shallow(
      <UsersShowPage params={{ slug: user.attributes.slug }} intl={intl} />
    );
    wrapper.find('WrappedUserNavbar').prop('selectTab')('comments')();
    wrapper.update();
    expect(mockScroll).toHaveBeenCalledWith(0, 0);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly with an erroneous user', () => {
    useUser.mockImplementation(() => new Error());
    const wrapper = shallow(
      <UsersShowPage params={{ slug: 'non-existent' }} intl={intl} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
