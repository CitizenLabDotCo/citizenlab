import React from 'react';

import { shallow } from 'enzyme';
import 'jest-styled-components';

import Checkbox from './';

const getValue = jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
const onChangeCheckbox = jest.fn();

describe('Checkbox UI component', () => {
it('renders when unchecked', () => {
    const checkbox = shallow(<Checkbox label="test" value={getValue()} onChange={onChangeCheckbox} />);
    expect(checkbox).toMatchSnapshot();
  });
it('renders when checked', () => {
    const checkbox = shallow(<Checkbox label="test" value={getValue()} onChange={onChangeCheckbox} />);
    expect(checkbox).toMatchSnapshot();
  });

it('changes', () => {
    const checkbox = shallow(<Checkbox label="test" value={getValue()} onChange={onChangeCheckbox} />);
    checkbox.find('Checkbox__CheckboxContainer').simulate('click', { preventDefault() {}, stopPropagation() {} });
    expect(onChangeCheckbox).toBeCalledTimes(1);
  });
});
