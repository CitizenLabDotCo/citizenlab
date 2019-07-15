import React from 'react';
import { shallow } from 'enzyme';
import 'jest-styled-components';
import { mockWithRouterProps } from '../../utils/cl-router/__mocks__/withRouter';
import leaflet from 'leaflet';
import { IdeasMap } from '.';

jest.mock('leaflet');

describe('IdeasMap', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <IdeasMap
        ideaMarkers={[]}
        projectIds={['379cac45-d26b-505c-9215-b2677a693d37']}
        phaseId="c43968d3-171e-570c-8b71-f5fc0e55bbfa"
        {...mockWithRouterProps}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls leaflet.popup() when child Map calls onMapClick', () => {
    const wrapper = shallow(
      <IdeasMap
        ideaMarkers={[]}
        projectIds={['379cac45-d26b-505c-9215-b2677a693d37']}
        phaseId="c43968d3-171e-570c-8b71-f5fc0e55bbfa"
        {...mockWithRouterProps}
      />
    );
    wrapper.find('IdeasMap__StyledMap').simulate('click');
    expect(leaflet.popup).toBeCalledTimes(1);
  });
});
