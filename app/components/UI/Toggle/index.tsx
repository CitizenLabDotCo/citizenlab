import React from 'react';
import styled, { css } from 'styled-components';
import { colors, fontSizes, customOutline } from 'utils/styleUtils';

const padding = 4;

const Label = styled.label<{ labelTextColor?: string }>`
  display: inline-block;
  color: ${({ labelTextColor }) => labelTextColor || '#333'};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 20px;
  cursor: pointer;

  &.hasLabel {
    display: flex;
    align-items: center;
  }
`;

const HiddenInput = styled.input`
  // Hide checkbox visually but remain accessible to screen readers.
  // Source: https://polished.js.org/docs/#hidevisually
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const ToggleContainer: any = styled.div<{ size: number }>`
  height: ${({ size }) => size + padding * 2}px;
  display: flex;
  align-items: center;
  margin-right: 10px;

  ${HiddenInput}:focus + & {
    outline: ${customOutline};
  }

  ${(props: any) => props.disabled && css`
    opacity: 0.25;

    i,
    i:before {
      cursor: not-allowed;
    }
  `};

  ${(props: any) => props.checked && css`
    i {
      padding-right: ${padding}px !important;
      padding-left: ${props.size}px !important;
      background: ${colors.clGreen} !important;
    }
  `};

  input {
    display: none;
  }

  i {
    display: inline-block;
    cursor: pointer;
    padding: ${padding}px;
    padding-right: ${({ size }) => size}px;
    transition: all ease 0.15s;
    border-radius: ${({ size }) => size + padding}px;
    background: #ccc;
    transform: translate3d(0, 0, 0);

    &:before {
      display: block;
      content: '';
      width: ${({ size }) => size}px;
      height: ${({ size }) => size}px;
      border-radius: ${({ size }) => size}px;
      background: #fff;
    }
  }
`;

export type Props = {
  checked: boolean;
  disabled?: boolean | undefined;
  label?: string | JSX.Element | null | undefined;
  size?: number;
  onChange: (event: React.FormEvent<any>) => void;
  className?: string;
  id?: string;
  labelTextColor?: string;
};

type State = {};

export default class Toggle extends React.PureComponent<Props, State> {
  static defaultProps = {
    size: 21
  };

  handleOnClick = (event) => {
    event.preventDefault();

    if (!this.props.disabled) {
      this.props.onChange(event);
    }
  }

  render() {
    const {
      checked,
      disabled,
      label,
      className,
      id,
      onChange,
      labelTextColor,
      size
    } = this.props;
    const hasLabel = !!(label);

    return (
      <Label
        id={id}
        className={`
          ${className}
          ${hasLabel && 'hasLabel'}
        `}
        labelTextColor={labelTextColor}
      >
        <HiddenInput
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <ToggleContainer
          checked={checked}
          disabled={disabled}
          size={size}
        >
          <i />
        </ToggleContainer>
        {label}
      </Label>
    );
  }
}
