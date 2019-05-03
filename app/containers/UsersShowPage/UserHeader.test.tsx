// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { UserHeader } from './UserHeader';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('services/comments');
import { makeUser } from 'services/__mocks__/users';

describe('<UserHeader />', () => {

  it('renders correctly on some user without a bio', () => {
    const user = makeUser();
    const Wrapper = shallow(<UserHeader user={user.data} />);
    expect(Wrapper).toMatchSnapshot();
  });
  it('renders correctly on some user with a bio', () => {
    const user = makeUser({ bio_multiloc: { en: 'Hi there ! ' } });
    const Wrapper = shallow(<UserHeader user={user.data} />);
    expect(Wrapper).toMatchSnapshot();
  });
  it('renders correctly on your own profile', () => {
    const user = makeUser({}, 'someUser');
    const Edit = shallow(<UserHeader user={user.data} authUser={{ id: 'someUser' }} />)
    .find('UserHeader__EditProfile');
    expect(Edit).toMatchSnapshot();
  });
  it('renders correctly when user is null', () => {
    const Edit = shallow(<UserHeader user={null} />)
    .find('UserHeader__EditProfile');
    expect(Edit).toMatchSnapshot();
  });

});
