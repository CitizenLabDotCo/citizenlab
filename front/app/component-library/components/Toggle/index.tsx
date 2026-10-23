import React, { PureComponent, FormEvent, ReactNode } from 'react';

import { hideVisually, darken } from 'polished';
import styled, { css } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

import { colors, fontSizes, focusRing, isRtl } from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';

type Size = 'small' | 'medium';
type Variant = 'default' | 'bo';

// The back-office switch: a 26 by 16 track with a 12px knob.
const BO_KNOB = 12;
const BO_PADDING = 2;

const mediumSize = 21;
const smallSize = 15;
const padding = 3;

const SIZES: Record<Size, number> = {
  small: smallSize,
  medium: mediumSize,
};

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
  variant: Variant;
}>`
  display: inline-block;
  padding: ${padding}px;
  padding-right: ${(props) => props.sizeInPixels}px;
  border-radius: ${(props) => props.sizeInPixels + padding}px;
  background-color: ${colors.grey400};
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

  ${(props) =>
    props.variant === 'bo' &&
    css`
      padding: ${BO_PADDING}px ${BO_KNOB}px ${BO_PADDING}px ${BO_PADDING}px;
      border: none;
      border-radius: 999px;
      background-color: ${colors.grey300};
      transition: padding 150ms ease-out, background-color 150ms ease-out;

      &:before {
        width: ${BO_KNOB}px;
        height: ${BO_KNOB}px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      &.enabled:hover {
        background: ${props.checked ? colors.textPrimary : colors.grey400};
      }

      ${props.checked &&
      css`
        padding: ${BO_PADDING}px ${BO_PADDING}px ${BO_PADDING}px ${BO_KNOB}px;
        background-color: ${colors.coolGrey700};
      `}
    `};
`;

const StyledToggleWrapper = styled.div<{
  checked: boolean;
  disabled: boolean;
  sizeInPixels: number;
  variant: Variant;
}>`
  height: ${(props) =>
    props.variant === 'bo'
      ? BO_KNOB + BO_PADDING * 2
      : props.sizeInPixels + padding * 2}px;
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

const LabelAndDescription = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 10px;

  ${isRtl`
    padding-left: 0;
    padding-right: 10px;
  `}
`;

const Label = styled.label<{ labelTextColor?: string }>`
  color: ${({ labelTextColor }) => labelTextColor || colors.textPrimary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  cursor: pointer;
`;

const Description = styled.span`
  display: block;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
`;

interface Props {
  checked: boolean;
  disabled?: boolean | undefined;
  label?: string | JSX.Element | null | undefined;
  description?: ReactNode;
  labelTextColor?: string;
  size?: Size;
  /** 'bo' is the back-office switch; it ignores `size`. */
  variant?: Variant;
  onChange: (event: FormEvent) => void;
  className?: string;
  id?: string;
}

class Toggle extends PureComponent<Props> {
  instanceId = uuidv4();
  descriptionId = `toggle-description-${this.instanceId}`;

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
      description,
      labelTextColor,
      className,
      id,
      size = 'medium',
      variant = 'default',
      onChange,
    } = this.props;

    const sizeInPixels = SIZES[size];
    const inputId = id ?? `toggle-${this.instanceId}`;

    return (
      <Container className={`${className || ''} ${label ? 'hasLabel' : ''}`}>
        <HiddenCheckbox
          onChange={onChange}
          checked={checked}
          disabled={disabled}
          tabIndex={0}
          id={inputId}
          aria-describedby={description ? this.descriptionId : undefined}
        />

        <StyledToggleWrapper
          checked={checked}
          disabled={!!disabled}
          onClick={this.handleOnClick}
          data-testid={testEnv('toggle')}
          sizeInPixels={sizeInPixels}
          variant={variant}
        >
          <StyledToggle
            checked={checked}
            disabled={!!disabled}
            className={disabled ? 'disabled' : 'enabled'}
            sizeInPixels={sizeInPixels}
            variant={variant}
          />
        </StyledToggleWrapper>

        {label && (
          <LabelAndDescription>
            <Label
              htmlFor={inputId}
              onClick={this.handleOnClick}
              labelTextColor={labelTextColor}
              data-cy={id}
            >
              {label}
            </Label>
            {description && (
              <Description id={this.descriptionId}>{description}</Description>
            )}
          </LabelAndDescription>
        )}
      </Container>
    );
  }
}

export default Toggle;
