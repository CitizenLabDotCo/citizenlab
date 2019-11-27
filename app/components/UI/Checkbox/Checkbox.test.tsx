import React from 'react';
import { shallow } from 'enzyme';
import Checkbox from '.';
import 'jest-styled-components';

describe('Checkbox UI component', () => {
  let onChange: jest.Mock;

  beforeEach(() => {
    onChange = jest.fn();
  });

  it('changes when clicked', () => {
    const wrapper = shallow(<Checkbox checked={false} onChange={onChange} />);
    wrapper.find('Checkbox__Container').simulate('click', { preventDefault() { }, stopPropagation() { } });
    expect(onChange).toBeCalledTimes(1);
  });
});
