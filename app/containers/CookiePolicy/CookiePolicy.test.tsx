jest.mock('utils/cl-intl');
import React from 'react';

import 'jest-styled-components';
import { shallow } from 'enzyme';
import { shallowWithTheme, mountWithTheme } from 'utils/testUtils/withTheme';

import CoopiePolicy from './';

const eventEmitter = jest.fn();

describe('CoopiePolicy UI component', () => {
  it('renders correctly', () => {
    const wrapper = mountWithTheme(<CoopiePolicy />);
    expect(wrapper).toMatchSnapshot();
  });
  it('opens consent manager', () => {
    const wrapper = shallow(<CoopiePolicy />);
    const cookiePreferencesButton = wrapper.find('button.cookiePreferences');
    cookiePreferencesButton.simulate('click');
    const cookieListButton = wrapper.find('button.cookieList');
    cookieListButton.simulate('click');
    expect(eventEmitter.mock.calls).toBe('');
  });
});
