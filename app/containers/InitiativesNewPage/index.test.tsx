import React from 'react';
import { shallow } from 'enzyme';
import { makeUser } from '../../services/__mocks__/users';
import clHistory from '../../utils/cl-router/history';
import { InitiativesNewPage } from './';

jest.mock('resources/GetAuthUser', () => 'GetAuthUser');
jest.mock('resources/GetLocale', () => 'GetLocale');
jest.mock('./InitiativesNewMeta', () => 'InitiativesNewMeta');
jest.mock('./InitiativesNewFormWrapper', () => 'InitiativesNewFormWrapper');
jest.mock('components/InitiativeForm/PageLayout', () => 'PageLayout');
jest.mock('utils/cl-router/history');
jest.mock('utils/locationTools');
jest.mock('services/users');

describe('InitiativesNewPage', () => {

  it('redirects unauthenticated users', () => {
    const Wrapper = shallow(
      <InitiativesNewPage
        locale="en"
        authUser={null}
        location={{
          query: {}
        }}
      />
     );

     expect(clHistory.replace).toHaveBeenCalledTimes(1);
     expect(clHistory.replace).toHaveBeenNthCalledWith(1, '/sign-up');
  });

  it('renders the initiatives formwrapper', () => {
    const Wrapper = shallow(
      <InitiativesNewPage
        locale="en"
        authUser={makeUser()}
        location={{
          query: {}
        }}
      />
     );

     expect(Wrapper.find('InitiativesNewFormWrapper').exists()).toBe(true);
  });
});
