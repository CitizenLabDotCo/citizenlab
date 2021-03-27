// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { DashboardsPage } from './';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('components/Outlet', () => 'Outlet');

import { mockAdmin, mockProjectModerator } from 'services/__mocks__/auth';
const Intl = require('utils/cl-intl/__mocks__/');
const { intl } = Intl;

describe('<DashboardsPage />', () => {
  // this is an integration test : it also tests how well our utilities function check access rights
  it('renders correctly with an admin user', () => {
    const wrapper = shallow(
      <DashboardsPage authUser={mockAdmin.data} intl={intl} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with a project moderator user', () => {
    const wrapper = shallow(
      <DashboardsPage
        authUser={mockProjectModerator('testProjectId').data}
        intl={intl}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
