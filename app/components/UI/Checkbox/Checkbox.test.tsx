import React from 'react';

import 'jest-styled-components';
import { shallowWithTheme } from 'utils/testUtils/withTheme';
import { colors } from 'utils/styleUtils';

import Checkbox from './';

const onChangeCheckbox = jest.fn();

describe('Checkbox UI component', () => {
it('renders when unchecked', () => {
    const checkbox = shallowWithTheme(<Checkbox label="test" value={false} onChange={onChangeCheckbox} />);
    expect(checkbox).toMatchSnapshot();
  });
it('renders when checked', () => {
    const checkbox = shallowWithTheme(<Checkbox label="test" value={true} onChange={onChangeCheckbox} />);
    expect(checkbox.find('Checkbox__CheckboxContainer')).toHaveStyleRule('background', colors.clGreen);
    expect(checkbox).toMatchSnapshot();
  });
it('changes when clicked', () => {
    const checkbox = shallowWithTheme(<Checkbox label="test" value={false} onChange={onChangeCheckbox} />);
    checkbox.find('Checkbox__CheckboxContainer').simulate('click', { preventDefault() {}, stopPropagation() {} });
    expect(onChangeCheckbox).toBeCalledTimes(1);
  });
});
