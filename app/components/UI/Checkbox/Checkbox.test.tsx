import React from 'react';

import 'jest-styled-components';
import { shallow } from 'enzyme';
import { mountWithTheme } from 'utils/testUtils/withTheme';
import { colors } from 'utils/styleUtils';

import Checkbox from './';

const onChangeCheckbox = jest.fn();

describe('Checkbox UI component', () => {
  it('renders correctly when unchecked', () => {
    const wrapper = mountWithTheme(<Checkbox label="test" value={false} onChange={onChangeCheckbox} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when checked', () => {
    const wrapper = mountWithTheme(<Checkbox label="test" value={true} onChange={onChangeCheckbox} />);
    const { clGreen } = colors;
    expect(wrapper.find('Checkbox__CheckboxContainer')).toHaveStyleRule('background', clGreen);
    expect(wrapper).toMatchSnapshot();
  });
  it('changes when clicked', () => {
    const wrapper = shallow(<Checkbox label="test" value={false} onChange={onChangeCheckbox} />);
    wrapper.find('Checkbox__CheckboxContainer').simulate('click', { preventDefault() { }, stopPropagation() { } });
    expect(onChangeCheckbox).toBeCalledTimes(1);
  });
});
