import React, { PureComponent } from 'react';
import { isString } from 'lodash-es';
import { IOption } from 'typings';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  position: relative;
`;

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
  font-size: ${fontSizes.base}px;
  line-height: normal;
  cursor: pointer;
  margin: 0;
  padding: 0;
  padding: 10px;
  padding-right: 27px;
  border-radius: 5px;
  border: solid 1px #aaa;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;

  &::-ms-expand {
    display: none;
  }

  &:not(.disabled) {
    color: #333;
    border: solid 1px #999;

    &:focus,
    &:hover {
      color: #000;
      border-color: #000;

      ${Arrow} {
        display: none;
        border-top-color: red !important;
      }
    }
  }

  &.disabled {
    cursor: not-allowed;
    color: #aaa;
    border: solid 1px #aaa;

    ${Arrow} {
      border-top-color: #aaa;
    }
  }
`;

export type Props = {
  id?: string;
  value?: IOption | string | null;
  placeholder?: string | JSX.Element | null;
  options: IOption[] | null;
  onChange: (arg: IOption) => void;
  disabled?: boolean;
  borderColor?: string;
  className?: string;
};

type State = {};

export default class Select extends PureComponent<Props, State> {

  handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.props.options) {
      const selectedOption = this.props.options.find(option => option.value === event.target.value) as IOption;
      this.props.onChange(selectedOption);
    }
  }

  render() {
    const { id, borderColor, disabled, className } = this.props;
    let { value, placeholder, options } = this.props;

    value = isString(value) && options ? options.find((option) => option.value === value) : value;
    placeholder = (placeholder || '');
    options = (options || []);

    return (
      <Container className={className}>
        <CustomSelect
          id={id}
          disabled={disabled}
          onChange={this.handleOnChange}
          className={disabled ? 'disabled' : ''}
        >
          {options && options.length > 0 && options.map((option, index) => {
            const isSelected = value && value['value'] && option.value === value['value'];

            return (
              <option
                key={index}
                value={option.value}
                selected={isSelected}
                aria-selected={isSelected}
              >
                {option.label}
              </option>
            );
          })}
        </CustomSelect>
        <Arrow className={disabled ? 'disabled' : ''} />
      </Container>
    );
  }
}
