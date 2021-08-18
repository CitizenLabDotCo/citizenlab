// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';
import UserName from './';
import { mockUser } from 'services/__mocks__/users';

jest.mock('hooks/useUser', () => jest.fn(() => mockUser.data));
jest.mock('utils/cl-intl');

describe('UserName', () => {
  it('renders the component', () => {
    const Wrapper = shallow(<UserName userId={'userId'} />);

    expect(Wrapper).toMatchSnapshot();
  });

  it('wraps the NameComponent with Link with the isLinkToProfile prop', () => {
    const Wrapper = shallow(<UserName userId={'userId'} isLinkToProfile />);

    expect(Wrapper).toMatchSnapshot();
  });
});
