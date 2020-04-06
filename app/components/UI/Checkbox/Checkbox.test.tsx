import React from 'react';
import { shallow } from 'enzyme';
import Checkbox from '.';
import 'jest-styled-components';

describe('Checkbox UI component', () => {
  let onChange: jest.Mock;

  beforeEach(() => {
    onChange = jest.fn();
  });

  it('onChange to be called when checkbox is clicked', () => {
    const wrapper = shallow(<Checkbox checked={false} onChange={onChange} />);
    wrapper.find('Checkbox__HiddenCheckbox').simulate('change');
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
