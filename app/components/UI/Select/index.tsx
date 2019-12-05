import React, { PureComponent } from 'react';
import { isString, get } from 'lodash-es';
import { IOption } from 'typings';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Arrow = styled.div`
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: solid 5px #333;
  cursor: pointer;
  position: absolute;
  top: 20px;
  right: 11px;
`;

const CustomSelect = styled.select`
  width: 100%;
  color: #333;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  margin: 0;
  padding: 0;
  padding: 10px;
  padding-right: 27px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: #fff;
  border: solid 1px #ccc;
  cursor: pointer;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;

  &::-ms-expand {
    display: none;
  }
`;

const Container = styled.div`
  position: relative;

  &.enabled {
    &:hover,
    &:focus {
      ${CustomSelect} {
        color: #000;
        border-color: #999;
      }

      ${Arrow} {
        border-top-color: #000;
      }
    }
  }

  &.disabled {
    ${CustomSelect} {
      cursor: not-allowed;
      color: #bbb;
      border-color: #ddd;
      background: #f9f9f9;
    }

    ${Arrow} {
      cursor: not-allowed;
      border-top-color: #bbb;
    }
  }
`;

export interface DefaultProps {
  canBeEmpty?: boolean;
}

export interface Props extends DefaultProps {
  id?: string;
  value?: IOption | string | null;
  placeholder?: string | JSX.Element | null;
  options: IOption[] | null;
  onChange: (arg: IOption) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
}

interface State {}

export default class Select extends PureComponent<Props, State> {

  static defaultProps: DefaultProps = {
    canBeEmpty: false
  };

  handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.props.options) {
      const selectedOption = this.props.options.find(option => option.value.toString() === event.target.value.toString()) as IOption;
      this.props.onChange(selectedOption);
    }
  }

  handleOnBlur = (event: React.FocusEvent<HTMLSelectElement>) => {
    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  }

  render() {
    const { id, disabled, className, options, canBeEmpty } = this.props;
    const defaultValue = 'DEFAULT_SELECT_VALUE';
    const value = isString(this.props.value) ? this.props.value : get(this.props.value, 'value', null) as string | null;
    const selectedValue = !!(options && options.find(option => option.value === value)) ? options.find(option => option.value === value)?.value as string : defaultValue;

    return (
      <Container className={`${className} ${disabled ? 'disabled' : 'enabled'}`}>
        <CustomSelect
          id={id}
          disabled={disabled}
          onChange={this.handleOnChange}
          onBlur={this.handleOnBlur}
          className={disabled ? 'disabled' : 'enabled'}
          value={selectedValue}
        >
          <option
            value={defaultValue}
            aria-selected={selectedValue === defaultValue}
            hidden={!canBeEmpty}
            disabled={!canBeEmpty}
          />

          {options && options.length > 0 && options.map((option, index) => (
            <option
              key={index}
              value={option.value}
              aria-selected={selectedValue === option.value}
            >
              {option.label}
            </option>
          ))}
        </CustomSelect>
        <Arrow className={disabled ? 'disabled' : 'enabled'} />
      </Container>
    );
  }
}
