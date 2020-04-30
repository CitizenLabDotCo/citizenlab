import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { fontSizes, colors, boxShadowOutline } from 'utils/styleUtils';
import { get } from 'lodash-es';
import { hideVisually } from 'polished';

const HiddenRadio = styled.input.attrs({ type: 'radio' })`
  ${hideVisually()};
`;

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
  border: solid 1px ${colors.separationDarkOnGreyBackground};
  transition: all 120ms ease-out;

  ${HiddenRadio}.focus-visible + & {
    ${boxShadowOutline};
  }

  &.enabled:hover {
    border-color: #000;
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
  margin-bottom: 12px;

  & > :not(last-child) {
    margin-right: 7px;
  }

  &.enabled {
    cursor: pointer;

    &:hover {
      ${CustomRadio} {
        border-color: #000;
      }
    }
  }
`;

/**
 * If we have a label, an id is required. Otherwise id is optional.
 */
type LabelProps = {
  label: string | JSX.Element | null,
  id: string
} | {
  label?: undefined,
  id?: string | undefined
};

export type Props = LabelProps & {
  onChange?: { (event): void };
  currentValue?: any;
  value: any;
  /**
   * Name should be a string that is the same for all radios of the same radio group and unique for each radio group.
   * E.g. if you have a poll with two questions and each question has four answers/radios,
   * radios of each question should have the same name, but it should be different from those
   * of the second question. See PollForm.tsx for a good example.
   */
  name: string | undefined;
  disabled?: boolean;
  buttonColor?: string | undefined;
  className?: string;
  isRequired?: boolean;
};

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

  handleOnChange = (event: React.FormEvent) => {
    const { onChange, value, disabled } = this.props;

    if (!disabled && onChange) {
      const targetElement = get(event, 'target') as any;
      const parentElement = get(event, 'target.parentElement');
      const targetElementIsLink = targetElement && targetElement.hasAttribute && targetElement.hasAttribute('href');
      const parentElementIsLink = parentElement && parentElement.hasAttribute && parentElement.hasAttribute('href');

      if (!targetElementIsLink && !parentElementIsLink) {
        onChange(value);
      }
    }

  }

  handleOnFocus = () => {
    this.setState({ inputFocused: true });
  }

  handleOnBlur = () => {
    this.setState({ inputFocused: false });
  }

  render() {
    const {
      id,
      name,
      value,
      currentValue,
      disabled,
      buttonColor,
      label,
      className,
      isRequired
    } = this.props;
    const { inputFocused } = this.state;
    const checked = (value === currentValue);

    return (
      <Label
        htmlFor={id}
        className={`
          ${className || ''}
          text
          ${disabled ? 'disabled' : 'enabled'}`
        }
      >
        <HiddenRadio
          id={id}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          aria-checked={checked}
          onFocus={this.handleOnFocus}
          onBlur={this.handleOnBlur}
          onChange={this.handleOnChange}
          required={isRequired}
        />

        <CustomRadio
          className={
            `${inputFocused ? 'focused' : ''}
            ${checked ? 'checked' : ''}
            ${disabled ? 'disabled' : 'enabled'}
            circle`
          }
        >
          {checked && <Checked aria-hidden color={buttonColor || colors.clGreen} />}
        </CustomRadio>
        {label}
      </Label>
    );
  }
}
