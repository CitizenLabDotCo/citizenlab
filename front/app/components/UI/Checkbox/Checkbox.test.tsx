import React from 'react';
import { shallow } from 'enzyme';
import 'jest-styled-components';
import Checkbox from '.';

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
