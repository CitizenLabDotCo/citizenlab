import React from 'react';
import { shallow } from 'enzyme';

import Todo from '../index';

describe('<Todo />', () => {
  it('Expect to have unit tests specified', () => {
    const wrapper = shallow(<Todo />);
    expect(wrapper.text()).toEqual('TodoComponent');
  });
});
