import React, { PureComponent } from 'react';
import { isBoolean } from 'lodash-es';
import { IOption } from 'typings';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Arrow = styled.div`
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #333;
  position: absolute;
  top: 20px;
  right: 11px;
`;

const CustomSelect = styled.select`
  width: 100%;
  color: #333;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  cursor: pointer;
  margin: 0;
  padding: 0;
  padding: 10px;
  padding-right: 27px;
  border-radius: 5px;
  border: solid 1px #ccc;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;

  &:focus {
    color: #333 !important;
    border-color: #000 !important;
  }

  &::-ms-expand {
    display: none;
  }
`;

const Container = styled.div`
  position: relative;

  &:not(.disabled):hover {
    ${CustomSelect} {
      border-color: #aaa;
    }
  }
`;

export type Props = {
  id?: string;
  inputId?: string;
  value?: IOption | string | null;
  placeholder?: string | JSX.Element | null;
  options: IOption[] | null;
  autoBlur?: boolean;
  clearable?: boolean;
  onChange: (arg: IOption) => void;
  onBlur?: () => void;
  disabled?: boolean;
  borderColor?: string;
  className?: string;
};

type State = {};

export default class Select extends PureComponent<Props, State> {

  handleOnChange = (newValue: IOption) => {
    this.props.onChange(newValue || null);
  }

  //  Needed to keep our API compatible with react-select v1
  //  For a native react-select solution, follow this issue:
  //  https://github.com/JedWatson/react-select/issues/2669
  findFullOptionValue = () => {
    const { options, value } = this.props;

    if (typeof value === 'string') {
      return options && options.find((option) => option.value === value);
    } else {
      return value;
    }
  }

  handleOpen = () => {
    const innerForm = document.getElementById('rules-group-inner-form');

    if (innerForm) {
      setTimeout(() => {
        innerForm.scrollTop = innerForm.scrollHeight;
      }, 10);
    }
  }

  emptyArray = [];

  render() {
    const { id, borderColor, className } = this.props;
    let { value, placeholder, options, autoBlur, clearable } = this.props;
    const { inputId } = this.props;
    const { disabled } = this.props;

    value = this.findFullOptionValue();
    placeholder = (placeholder || '');
    options = (options || this.emptyArray);
    autoBlur = (isBoolean(autoBlur) ? autoBlur : true);
    clearable = (isBoolean(clearable) ? clearable : true);

    console.log('value:');
    console.log(value);
    console.log('options:');
    console.log(options);

    return (
      <Container className={className}>
        <CustomSelect>
          <option>Apples</option>
          <option>Bananas</option>
          <option>Grapes</option>
          <option>Oranges</option>
          <option selected>A very long option name to test wrapping that makes no sense whatsoever</option>
        </CustomSelect>
        <Arrow />
      </Container>
    );

    // return (
    //   <ReactSelect
    //     id={id}
    //     inputId={inputId}
    //     className={className}
    //     isClearable={clearable}
    //     menuShouldScrollIntoView={false}
    //     blurInputOnSelect={autoBlur}
    //     value={value}
    //     placeholder={placeholder as string}
    //     options={options}
    //     onChange={this.handleOnChange}
    //     onBlur={this.props.onBlur}
    //     isDisabled={disabled}
    //     styles={styles}
    //     onMenuOpen={this.handleOpen}
    //     menuPlacement="auto"
    //   />
    // );
  }
}
