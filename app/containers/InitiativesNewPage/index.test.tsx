import React from 'react';
import { shallow } from 'enzyme';
import { makeUser } from '../../services/__mocks__/users';
import clHistory from '../../utils/cl-router/history';
import { InitiativesNewPage } from './';
import { mockTopicData } from 'services/__mocks__/topics';

jest.mock('resources/GetAuthUser', () => 'GetAuthUser');
jest.mock('resources/GetLocale', () => 'GetLocale');
jest.mock('resources/GetTopics', () => 'GetTopics');
jest.mock('./InitiativesNewMeta', () => 'InitiativesNewMeta');
jest.mock('./InitiativesNewFormWrapper', () => 'InitiativesNewFormWrapper');
jest.mock('components/InitiativeForm/PageLayout', () => 'PageLayout');
jest.mock('utils/cl-router/history');
jest.mock('utils/locationTools');
jest.mock('services/users');

describe('InitiativesNewPage', () => {
  it('redirects unauthenticated users', () => {
    const topics = [mockTopicData];

    const Wrapper = shallow(
      <InitiativesNewPage
        locale="en"
        topics={topics}
        authUser={null}
        location={{
          query: {},
        }}
      />
    );

    expect(clHistory.replace).toHaveBeenNthCalledWith(1, '/sign-up');
  });

  it('renders the initiatives formwrapper', () => {
    const topics = [mockTopicData];

    const Wrapper = shallow(
      <InitiativesNewPage
        locale="en"
        topics={topics}
        authUser={makeUser()}
        location={{
          query: {},
        }}
      />
    );

    expect(Wrapper.find('InitiativesNewFormWrapper').exists()).toBe(true);
  });
});
