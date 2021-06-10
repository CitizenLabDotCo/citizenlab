// @ts-nocheck
// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { UserHeader } from './UserHeader';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('services/comments');
jest.mock('modules', () => ({ streamsToReset: [] }));

import { makeUser } from 'services/__mocks__/users';

describe('<UserHeader />', () => {
  it('renders correctly on some user without a bio', () => {
    const user = makeUser();
    const Wrapper = shallow(<UserHeader windowSize={950} user={user.data} />);
    expect(Wrapper).toMatchSnapshot();
  });
  it('renders correctly on some user with a bio', () => {
    const user = makeUser({ bio_multiloc: { en: 'Hi there ! ' } });
    const Bio = shallow(<UserHeader windowSize={950} user={user.data} />).find(
      'UserHeader__Bio'
    );
    expect(Bio).toMatchSnapshot();
  });
  it('renders correctly on your own profile', () => {
    const user = makeUser({}, 'someUser');
    const Edit = shallow(
      <UserHeader
        windowSize={950}
        user={user.data}
        authUser={{ id: 'someUser' }}
      />
    ).find('.e2e-edit-profile');
    expect(Edit.prop('linkTo')).toBe('/profile/edit');
  });
  it('renders correctly when user is null', () => {
    const Edit = shallow(<UserHeader windowSize={950} user={null} />).find(
      '.e2e-edit-profile'
    );
    expect(Edit).toMatchSnapshot();
  });
});
