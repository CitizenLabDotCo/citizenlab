import React from 'react';
import 'jest-styled-components';
jest.mock('utils/cl-intl');
import { DashboardsPage } from './';

import { shallowWithIntl } from 'utils/testUtils/withIntl';
import { shallow } from 'enzyme';
import { mockUser, mockAdmin, mockProjectModerator } from 'services/__mocks__/auth';

describe('<DashboardsPage />', () => {
  it('renders correctly with an admin user', () => {
    const wrapper = shallowWithIntl(<DashboardsPage authUser={mockAdmin.data} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with a project moderator user', () => {
    const wrapper = shallowWithIntl(<DashboardsPage authUser={mockProjectModerator('testProjectId').data} />);
    expect(wrapper).toMatchSnapshot();
  });
});
