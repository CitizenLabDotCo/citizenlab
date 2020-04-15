import React from 'react';
import styled, { css } from 'styled-components';
import { colors, fontSizes, customOutline } from 'utils/styleUtils';

const size = 21;
const padding = 4;

const Label = styled.label`
  display: inline-block;
  color: #333;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 20px;
  padding-left: 10px;
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

const ToggleContainer: any = styled.div`
  height: ${size + padding * 2}px;
  display: flex;
  align-items: center;

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
      padding-left: ${size}px !important;
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
    padding-right: ${size}px;
    transition: all ease 0.15s;
    border-radius: ${size + padding}px;
    background: #ccc;
    transform: translate3d(0, 0, 0);

    &:before {
      display: block;
      content: '';
      width: ${size}px;
      height: ${size}px;
      border-radius: ${size}px;
      background: #fff;
    }
  }
`;

export type Props = {
  checked: boolean;
  disabled?: boolean | undefined;
  label?: string | JSX.Element | null | undefined;
  size?: 'small' | 'normal' | 'large';
  onChange: (event: React.FormEvent<any>) => void;
  className?: string;
  id?: string;
};

type State = {};

export default class Toggle extends React.PureComponent<Props, State> {
  handleOnClick = (event) => {
    event.preventDefault();

    if (!this.props.disabled) {
      this.props.onChange(event);
    }
  }

  render() {
    const { checked, disabled, label, className, id, onChange } = this.props;

    return (
      <Label id={id} className={`${className} ${label && 'hasLabel'}`}>
        <HiddenInput
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <ToggleContainer
          checked={checked}
          disabled={disabled}
        >
          <i />
        </ToggleContainer>
        {label}
      </Label>
    );
  }
}
