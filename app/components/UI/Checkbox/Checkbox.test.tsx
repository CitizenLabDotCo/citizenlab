import React from 'react';
import { shallow } from 'enzyme';
import { mountWithTheme } from 'utils/testUtils/withTheme';

// to both reder the styles and have methods to test them, this is how
import 'jest-styled-components';

import { colors } from 'utils/styleUtils';

import Checkbox from '.';

// creating a mock function to pass in to the component
const onChangeCheckbox = jest.fn();

describe('Checkbox UI component', () => {
  it('renders correctly when unchecked', () => {
    const wrapper = mountWithTheme(<Checkbox label="test" checked={false} onChange={onChangeCheckbox} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when checked', () => {
    const wrapper = mountWithTheme(<Checkbox label="test" checked={true} onChange={onChangeCheckbox} />);
    const { clGreen } = colors;

    expect(wrapper.find('Checkbox__InputWrapper')).toHaveStyleRule('background', clGreen);
    expect(wrapper).toMatchSnapshot();
  });
  it('changes when clicked', () => {
    const wrapper = shallow(<Checkbox label="test" checked={false} onChange={onChangeCheckbox} />);
    wrapper.find('Checkbox__InputWrapper').simulate('click', { preventDefault() { }, stopPropagation() { } });
    expect(onChangeCheckbox).toBeCalledTimes(1);
  });
});
