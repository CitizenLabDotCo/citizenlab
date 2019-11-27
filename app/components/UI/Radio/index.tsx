import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { fontSizes, customOutline } from 'utils/styleUtils';
import { get } from 'lodash-es';

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

  &.focused {
    outline: ${customOutline};
    border-color: #000;
  }

  &.enabled {
    cursor: pointer;

    &:hover,
    &:active {
      border-color: #000;
    }
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
  line-height: normal;

  & > :not(last-child) {
    margin-right: 7px;
  }

  &.enabled {
    cursor: pointer;
  }
`;

const Input = styled.input`
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

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  &.enabled {
    &:hover {
      ${CustomRadio} {
        border-color: #000;
      }
    }
  }
`;

export interface Props {
  onChange?: {(event): void};
  currentValue?: any;
  value: any;
  /**
   * name should be a hard-coded string for all radios of the same radio group
   */
  name: string | undefined;
  id?: string | undefined;
  label?: string | JSX.Element;
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

  handleOnClick = (event: React.MouseEvent) => {
    if (!this.props.disabled && this.props.onChange) {
      const targetElement = get(event, 'target') as any;
      const parentElement = get(event, 'target.parentElement');
      const targetElementIsLink = targetElement && targetElement.hasAttribute && targetElement.hasAttribute('href');
      const parentElementIsLink = parentElement && parentElement.hasAttribute && parentElement.hasAttribute('href');

      if (!targetElementIsLink && !parentElementIsLink) {
        event && event.preventDefault();
        this.props.onChange(this.props.value);
      }
    }
  }

  handleOnFocus = () => {
    this.setState({ inputFocused: true });
  }

  handleOnBlur = () => {
    this.setState({ inputFocused: false });
  }

  removeFocus = (event: React.FormEvent) => {
    event.preventDefault();
  }

  render() {
    const { id, name, value, currentValue, disabled, buttonColor, label, className } = this.props;
    const { inputFocused } = this.state;
    const checked = (value === currentValue);

    return (
      <Container
        onMouseDown={this.removeFocus}
        onClick={this.handleOnClick}
        className={`${className} ${disabled ? 'disabled' : 'enabled'}`}
      >
        <Input
          id={id}
          type="radio"
          name={name}
          value={value}
          defaultChecked={checked}
          onFocus={this.handleOnFocus}
          onBlur={this.handleOnBlur}
        />

        <CustomRadio className={`${inputFocused ? 'focused' : ''} ${checked ? 'checked' : ''} ${disabled ? 'disabled' : 'enabled'} circle`}>
          {checked && <Checked aria-hidden color={buttonColor || '#49B47D'}/>}
        </CustomRadio>

        {label &&
          <Label htmlFor={id} className={`text ${disabled ? 'disabled' : 'enabled'}`}>{label}</Label>
        }
      </Container>
    );
  }
}
