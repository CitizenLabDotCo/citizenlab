import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { fontSizes, customOutline } from 'utils/styleUtils';
import { hideVisually } from 'polished';
import uuidv1 from 'uuid/v1';

export const CustomRadio = styled.div`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  margin-right: 10px;
  position: relative;
  background: #fff;
  border-radius: 50%;
  border: 1px solid #a6a6a6;
  box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.15);
  cursor: pointer;

  &.focused {
      outline: ${customOutline};
  }

  &:not(.disabled) {
    cursor: pointer;

    &:hover,
    &:active {
      border-color: #000;
    }

    &.focused {
      border-color: #000;
    }
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;

  &.disabled {
    cursor: not-allowed;
  }

  // &:hover, &:focus-within {
  //   .circle {
  //     border: 1px solid #000;
  //   }
  // }
`;

export const Checked = styled.div`
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  background: ${(props: any) => props.color};
  border-radius: 50%;
`;

const Label = styled.label`
  display: flex;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 20px;
  & > :not(last-child) {
    margin-right: 7px;
  }
`;

const HiddenInput = styled.input`
  &[type='radio'] {
    /* See: https://snook.ca/archives/html_and_css/hiding-content-for-accessibility */
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
    clip: rect(1px, 1px, 1px, 1px);
  }
`;

export interface Props {
  onChange?: {(event): void};
  currentValue?: any;
  value: any;
  name?: string | undefined;
  id?: string | undefined;
  label: string | JSX.Element;
  disabled?: boolean;
  buttonColor?: string | undefined;
  className?: string;
}

interface State {
  inputFocused: boolean;
}

export default class Radio extends PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      inputFocused: false
    };
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    this.handleChange();
  }

  handleOnEnterKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.handleChange();
    }
  }

  handleChange = () => {
    if (!this.props.disabled && this.props.onChange) {
      this.props.onChange(this.props.value);
    }
  }

  handleOnFocus = () => {
    this.setState({
      inputFocused: true
    });
  }

  handleOnBlur = () => {
    this.setState({
      inputFocused: false
    });
  }

  render() {
    const { name, value, currentValue, disabled, buttonColor, label, className } = this.props;
    const { inputFocused } = this.state;
    const checked = (value === currentValue);
    const uuid = uuidv1();

    return (
      <Wrapper className={`${className} ${disabled ? 'disabled' : ''}`}>
        <CustomRadio
          onMouseDown={this.removeFocus}
          onClick={this.handleClick}
          onKeyDown={this.handleOnEnterKeyPress}
          className={`${inputFocused ? 'focused' : ''} ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} circle`}
        >
          <HiddenInput
            type="radio"
            name={name}
            value={value}
            aria-checked={checked}
            checked={checked}
            // onChange={this.handleChange}
            id={uuid}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
          />
          {checked &&
            <Checked aria-hidden color={(buttonColor || '#49B47D')}/>
          }
        </CustomRadio>
        <Label htmlFor={uuid} className="text">{label}</Label>
      </Wrapper>
    );
  }
}
