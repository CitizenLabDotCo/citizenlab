import React, { PureComponent, FormEvent } from 'react';

import { hideVisually, darken } from 'polished';
import styled, { css } from 'styled-components';

import {
  colors,
  fontSizes,
  defaultOutline,
  isRtl,
} from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';

const size = 21;
const padding = 3;

const Container = styled.div`
  display: inline-block;

  &.hasLabel {
    display: flex;
    align-items: center;

    ${isRtl`
        flex-direction: row-reverse;
    `}
  }
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  ${hideVisually()};
`;

const StyledToggle = styled.i<{ checked: boolean; disabled: boolean }>`
  display: inline-block;
  padding: ${padding}px;
  padding-right: ${size}px;
  border-radius: ${size + padding}px;
  background-color: #ccc;
  border: solid 1px transparent;
  transition: padding 150ms cubic-bezier(0.165, 0.84, 0.44, 1),
    background-color 80ms ease-out;

  &:before {
    display: block;
    content: '';
    width: ${size}px;
    height: ${size}px;
    border-radius: ${size}px;
    background: #fff;
    transition: all 80ms ease-out;
  }

  &.enabled:hover {
    background: ${(props) =>
      props.checked ? darken(0.05, colors.success) : '#bbb'};
  }

  ${(props) =>
    props.checked &&
    css`
      padding-right: ${padding}px;
      padding-left: ${size}px;
      background-color: ${colors.success};
    `};
`;

const StyledToggleWrapper = styled.div<{ checked: boolean; disabled: boolean }>`
  height: ${size + padding * 2}px;
  display: flex;
  align-items: center;
  cursor: pointer;

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.25;
      cursor: not-allowed;
    `};

  ${HiddenCheckbox}.focus-visible + & ${StyledToggle} {
    ${defaultOutline};
  }
`;

const Label = styled.label<{ labelTextColor?: string }>`
  color: ${({ labelTextColor }) => labelTextColor || colors.textPrimary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  padding-left: 10px;
  cursor: pointer;

  ${isRtl`
    padding-left: 0;
    padding-right: 10px;
  `}
`;

interface Props {
  checked: boolean;
  disabled?: boolean | undefined;
  label?: string | JSX.Element | null | undefined;
  labelTextColor?: string;
  onChange: (event: FormEvent) => void;
  className?: string;
  id?: string;
}

class Toggle extends PureComponent<Props> {
  handleOnClick = (event: FormEvent) => {
    if (!this.props.disabled) {
      event.preventDefault();
      this.props.onChange(event);
    }
  };

  render() {
    const {
      checked,
      disabled,
      label,
      labelTextColor,
      className,
      id,
      onChange,
    } = this.props;

    return (
      <Container className={`${className || ''} ${label ? 'hasLabel' : ''}`}>
        <HiddenCheckbox
          onChange={onChange}
          checked={checked}
          disabled={disabled}
          tabIndex={0}
          id={id}
        />

        <StyledToggleWrapper
          checked={checked}
          disabled={!!disabled}
          onClick={this.handleOnClick}
          data-testid={testEnv('toggle')}
        >
          <StyledToggle
            checked={checked}
            disabled={!!disabled}
            className={disabled ? 'disabled' : 'enabled'}
          />
        </StyledToggleWrapper>

        {label && (
          <Label
            htmlFor={id}
            onClick={this.handleOnClick}
            labelTextColor={labelTextColor}
            data-cy={id}
          >
            {label}
          </Label>
        )}
      </Container>
    );
  }
}

export default Toggle;
