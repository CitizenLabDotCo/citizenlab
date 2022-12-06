// @ts-nocheck
// libraries
import React from 'react';
import { shallow } from 'enzyme';
import { getNotification } from 'services/__mocks__/notifications';
// component to test
import AdminRightsReceivedNotification from './';

// mock utilities
jest.mock('utils/cl-intl');
jest.mock('utils/analytics', () => ({ trackEventByName: () => {} }));
jest.mock('modules', () => ({ streamsToReset: [] }));

describe('<AdminRightsReceivedNotification />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <AdminRightsReceivedNotification
        notification={getNotification('aminRights', 'admin_rights_received')}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
