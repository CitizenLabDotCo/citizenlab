import React, { PureComponent, FormEvent } from 'react';

import { hideVisually, darken } from 'polished';
import styled, { css } from 'styled-components';

import {
  bo,
  colors,
  fontSizes,
  focusRing,
  isRtl,
} from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';

type Size = 'small' | 'medium';
export type ToggleVariant = 'default' | 'bo';

const mediumSize = 21;
const smallSize = 15;
const padding = 3;

const SIZES: Record<Size, number> = {
  small: smallSize,
  medium: mediumSize,
};

// knob: diameter of the white circle; padding: gap around it;
// travel: extra padding on the empty side, i.e. how far the knob moves.
type Geometry = { knob: number; padding: number; travel: number };

// Back office 2026: 36 × 20 track, 16px knob, no border.
const BO_GEOMETRY: Geometry = { knob: 16, padding: 2, travel: 18 };

const getGeometry = (variant: ToggleVariant, size: Size): Geometry =>
  variant === 'bo'
    ? BO_GEOMETRY
    : { knob: SIZES[size], padding, travel: SIZES[size] };

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
  variant: ToggleVariant;
  geometry: Geometry;
}>`
  display: inline-block;
  padding: ${({ geometry }) => geometry.padding}px;
  padding-right: ${({ geometry }) => geometry.travel}px;
  border-radius: ${({ geometry }) => geometry.knob + geometry.padding}px;
  background-color: ${({ variant }) =>
    variant === 'bo' ? colors.grey300 : '#ccc'};
  border: ${({ variant }) =>
    variant === 'bo' ? 'none' : 'solid 1px transparent'};
  transition: padding 150ms cubic-bezier(0.165, 0.84, 0.44, 1),
    background-color 80ms ease-out;

  &:before {
    display: block;
    content: '';
    width: ${({ geometry }) => geometry.knob}px;
    height: ${({ geometry }) => geometry.knob}px;
    border-radius: ${({ geometry }) => geometry.knob}px;
    background: #fff;
    transition: all 80ms ease-out;
  }

  &.enabled:hover {
    background: ${({ checked, variant }) =>
      variant === 'bo'
        ? checked
          ? bo.colors.textHeadingStrong
          : colors.grey400
        : checked
        ? darken(0.05, colors.success)
        : '#bbb'};
  }

  ${({ checked, variant, geometry }) =>
    checked &&
    css`
      padding-right: ${geometry.padding}px;
      padding-left: ${geometry.travel}px;
      background-color: ${variant === 'bo'
        ? bo.colors.textHeadingStrong
        : colors.success};
    `};
`;

const StyledToggleWrapper = styled.div<{
  checked: boolean;
  disabled: boolean;
  variant: ToggleVariant;
  geometry: Geometry;
}>`
  height: ${({ geometry }) => geometry.knob + geometry.padding * 2}px;
  display: flex;
  align-items: center;
  cursor: pointer;

  ${({ disabled, variant }) =>
    disabled &&
    css`
      opacity: ${variant === 'bo' ? 0.5 : 0.25};
      cursor: not-allowed;
    `};

  ${HiddenCheckbox}.focus-visible + & ${StyledToggle} {
    ${focusRing}
  }
`;

const Label = styled.label<{
  labelTextColor?: string;
  variant: ToggleVariant;
}>`
  color: ${({ labelTextColor, variant }) =>
    labelTextColor ||
    (variant === 'bo' ? bo.colors.textHeading : colors.textPrimary)};
  font-size: ${({ variant }) =>
    variant === 'bo' ? fontSizes.s : fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  padding-left: ${({ variant }) => (variant === 'bo' ? 8 : 10)}px;
  cursor: pointer;

  ${({ variant }) => isRtl`
    padding-left: 0;
    padding-right: ${variant === 'bo' ? 8 : 10}px;
  `}
`;

interface Props {
  checked: boolean;
  disabled?: boolean | undefined;
  label?: string | JSX.Element | null | undefined;
  labelTextColor?: string;
  /** Ignored when variant is 'bo' (it has a single size). */
  size?: Size;
  /** 'bo' is the back office 2026 toggle: 36 × 20, dark when on. */
  variant?: ToggleVariant;
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
      variant = 'default',
      onChange,
    } = this.props;

    const geometry = getGeometry(variant, size);

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
          variant={variant}
          geometry={geometry}
        >
          <StyledToggle
            checked={checked}
            disabled={!!disabled}
            className={disabled ? 'disabled' : 'enabled'}
            variant={variant}
            geometry={geometry}
          />
        </StyledToggleWrapper>

        {label && (
          <Label
            htmlFor={id}
            onClick={this.handleOnClick}
            labelTextColor={labelTextColor}
            variant={variant}
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
