import React from 'react';
import { shallow } from 'enzyme';
jest.mock('utils/cl-intl');
jest.mock('resources/GetUserCustomFields');
jest.mock('services/stats');
jest.mock('components/Outlet', () => 'Outlet');

import {
  RegistrationFieldsToGraphs,
  Props,
} from './RegistrationFieldsToGraphs';
import { mockGetUserCustomFields } from 'resources/__mocks__/GetUserCustomFields';
import { mockUsersByRegFields } from 'services/__mocks__/stats';
import { localizeProps } from 'utils/testUtils/localizeProps';
import { intl } from 'utils/cl-intl';

describe('<RegistrationFieldsToGraphs />', () => {
  // this is a unit test to verify that this component "parses" the props that were passed in, and
  // renders an array of different components depending on the data with props like filters and time
  it('renders correctly', () => {
    const wrapper = shallow(
      <RegistrationFieldsToGraphs
        startAt="someTimeAgo"
        endAt="now"
        currentGroupFilter={null}
        customFields={mockGetUserCustomFields}
        intl={intl}
        {...localizeProps}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('correcly handles data', () => {
    const wrapper = shallow<Props>(
      <RegistrationFieldsToGraphs
        startAt="someTimeAgo"
        endAt="now"
        currentGroupFilter={null}
        customFields={mockGetUserCustomFields}
        intl={intl}
        {...localizeProps}
      />
    );
    const convertToGraphFormat = wrapper
      .find('WrappedBarChartByCategory')
      .prop('convertToGraphFormat') as Function;
    expect(convertToGraphFormat(mockUsersByRegFields)).toMatchSnapshot();
  });
});
