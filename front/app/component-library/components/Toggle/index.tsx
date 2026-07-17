import React, { PureComponent, FormEvent } from 'react';

import { hideVisually, darken } from 'polished';
import styled, { css } from 'styled-components';

import { colors, fontSizes, focusRing, isRtl } from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';

type Size = 'small' | 'medium';

const mediumSize = 21;
const smallSize = 15;
const padding = 3;

const SIZES: Record<Size, number> = {
  small: smallSize,
  medium: mediumSize,
}

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

const StyledToggle = styled.i<{
  checked: boolean;
  disabled: boolean;
  sizeInPixels: number;
}>`
  display: inline-block;
  padding: ${padding}px;
  padding-right: ${(props) => props.sizeInPixels}px;
  border-radius: ${(props) => props.sizeInPixels + padding}px;
  background-color: #ccc;
  border: solid 1px transparent;
  transition: padding 150ms cubic-bezier(0.165, 0.84, 0.44, 1),
    background-color 80ms ease-out;

  &:before {
    display: block;
    content: '';
    width: ${(props) => props.sizeInPixels}px;
    height: ${(props) => props.sizeInPixels}px;
    border-radius: ${(props) => props.sizeInPixels}px;
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
      padding-left: ${(props: any) => props.sizeInPixels}px;
      background-color: ${colors.success};
    `};
`;

const StyledToggleWrapper = styled.div<{ checked: boolean; disabled: boolean; sizeInPixels: number }>`
  height: ${(props) => props.sizeInPixels + padding * 2}px;
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
    ${focusRing}
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
  size?: Size;
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
      size = 'medium',
      onChange,
    } = this.props;

    const sizeInPixels = SIZES[size];

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
          sizeInPixels={sizeInPixels}
        >
          <StyledToggle
            checked={checked}
            disabled={!!disabled}
            className={disabled ? 'disabled' : 'enabled'}
            sizeInPixels={sizeInPixels}
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
