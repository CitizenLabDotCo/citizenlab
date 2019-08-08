import React from 'react';
import { shallow } from 'enzyme';
import { makeUser } from '../../services/__mocks__/users';
import clHistory from '../../utils/cl-router/history';
import { InitiativesNewPage } from './';

jest.mock('components/UI/GoBackButton', () => 'GoBackButton');
jest.mock('./TipsBox', () => 'TipsBox');
jest.mock('components/ContentContainer', () => 'ContentContainer');
jest.mock('resources/GetAuthUser', () => 'GetAuthUser');
jest.mock('resources/GetLocale', () => 'GetLocale');
jest.mock('utils/cl-intl/FormattedMessage', () => 'FormattedMessage');
jest.mock('./InitiativesFormWrapper', () => 'InitiativesFormWrapper');
jest.mock('utils/cl-router/history');
jest.mock('services/users');

describe('InitiativesNewPage', () => {

  it('redirects unauthenticated users', () => {
    const Wrapper = shallow(
      <InitiativesNewPage
        locale="en"
        authUser={null}
      />
     );

     expect(clHistory.push).toHaveBeenCalledTimes(1);
     expect(clHistory.push).toHaveBeenNthCalledWith(1, '/sign-up');
  });

  it('has a functinong goBack button', () => {
    const Wrapper = shallow(
      <InitiativesNewPage
        locale="en"
        authUser={makeUser()}
      />
     );

     Wrapper.find('GoBackButton').simulate('click');
     expect(clHistory.goBack).toHaveBeenCalledTimes(1);
  });

  it('renders the initiatives formwrapper', () => {
    const Wrapper = shallow(
      <InitiativesNewPage
        locale="en"
        authUser={makeUser()}
      />
     );

     expect(Wrapper.find('InitiativesFormWrapper').exists()).toBe(true);
  });
});
