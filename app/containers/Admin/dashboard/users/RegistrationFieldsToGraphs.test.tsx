import React from 'react';
import { shallow } from 'enzyme';
jest.mock('utils/cl-intl');
jest.mock('resources/GetCustomFields');
jest.mock('services/stats');
import { RegistrationFieldsToGraphs, Props } from './RegistrationFieldsToGraphs';
import { mockGetCustomFields } from 'resources/__mocks__/GetCustomFields';
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
        customFields={mockGetCustomFields}
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
        customFields={mockGetCustomFields}
        intl={intl}
        {...localizeProps}
      />
    );
    const convertToGraphFormat = wrapper.find('BarChartByCategoryComponent').prop('convertToGraphFormat') as Function;
    expect(convertToGraphFormat(mockUsersByRegFields)).toMatchSnapshot();
  });
});
