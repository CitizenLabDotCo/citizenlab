import React, { PureComponent, FormEvent, KeyboardEvent } from 'react';

import { isNil, isEmpty, size as lodashSize, isBoolean } from 'lodash-es';
import styled, { css } from 'styled-components';
import { Placement } from 'tippy.js';

import { ScreenReaderOnly } from '../../utils/a11y';
import {
  bo,
  colors,
  fontSizes,
  defaultInputStyle,
  defaultStyles,
  isRtl,
} from '../../utils/styleUtils';
import { Locale, InputSize } from '../../utils/typings';
import Error from '../Error';
import IconTooltip from '../IconTooltip';
import Label from '../Label';

type Variant = 'default' | 'bo';

interface ContainerProps {
  size: InputSize;
  variant: Variant;
}

const ringColor = (color: string) =>
  `0 0 0 3px color-mix(in srgb, ${color} 16%, transparent)`;

// The back-office text field from the design system:
// https://govocal.augur.page/ux-ui-audit/design-system/#field
const boInputStyle = css`
  input {
    height: 36px;
    padding: 0 12px;
    border: 1px solid ${colors.grey300};
    border-radius: ${bo.borderRadius};
    font-size: ${fontSizes.s}px;
    color: ${bo.colors.textHeadingStrong};
    transition: border-color 100ms ease-out, box-shadow 100ms ease-out;

    &::placeholder {
      color: ${colors.coolGrey500};
    }
  }

  input:not(:disabled):not(.disabled):not(.error):hover {
    border-color: ${colors.grey300};
  }

  input:not(:disabled):not(.disabled):not(.error):focus {
    border: 1px solid ${({ theme }) => theme.colors.tenantPrimary};
    box-shadow: ${({ theme }) => ringColor(theme.colors.tenantPrimary)};
  }

  input:not(:disabled):not(.disabled).error,
  input:not(:disabled):not(.disabled).error:focus {
    border: 1px solid ${colors.red600};
    box-shadow: ${ringColor(colors.red600)};
  }

  input:disabled,
  input.disabled {
    background: ${colors.grey50};
    color: ${colors.coolGrey500};
    border-color: ${colors.grey300};
  }
`;

const Container = styled.div<ContainerProps>`
  width: 100%;
  position: relative;

  input {
    width: 100%;

    &.hasMaxCharCount {
      padding-right: 62px;
    }
    ${isRtl`
      &.hasMaxCharCount {
          padding-right: ${defaultStyles.inputPadding};
          padding-left: 62px;
      }`}
    ${defaultInputStyle};
  }

  ${({ variant }) => variant === 'bo' && boInputStyle}
`;

const CharCount = styled.div<{ inputSize?: InputSize }>`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  text-align: right;
  position: absolute;
  bottom: ${({ inputSize }) => (inputSize === 'small' ? '10px' : '14px')};
  right: 10px;

  ${isRtl`
    left: 10px;
    right: auto;
  `}

  &.error {
    color: red;
  }
`;

const StyledInput = styled.input`
  &::placeholder {
    color: ${colors.coolGrey600};
    opacity: 1; /* Override Firefox's default opacity to provide the same UI for all browsers, See https://ilikekillnerds.com/2014/10/firefox-placeholder-text-looking-lighter-browsers/ */
  }
`;

export interface InputProps {
  ariaLabel?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  id?: string;
  label?: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
  labelTooltipPlacement?: Placement;
  value?: string | null;
  locale?: Locale;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'search'
    | 'hidden'
    | 'tel';
  placeholder?: string | null;
  error?: string | null;
  onChange?: (arg: string, locale: Locale | undefined) => void;
  onFocus?: (arg: FormEvent<HTMLInputElement>) => void;
  onBlur?: (arg: FormEvent<HTMLInputElement>) => void;
  setRef?: (arg: HTMLInputElement | null) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onMultilinePaste?: (lines: string[]) => void;
  autoFocus?: boolean;
  min?: string;
  max?: string;
  step?: string;
  name?: string;
  maxCharCount?: number;
  disabled?: boolean;
  spellCheck?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autocomplete?:
    | 'email'
    | 'tel'
    | 'username'
    | 'given-name'
    | 'family-name'
    | 'current-password'
    | 'new-password'
    | 'off'
    | 'on'; // https://www.w3.org/TR/WCAG21/#input-purposes
  a11yCharactersLeftMessage?: string;
  className?: string;
  size?: InputSize;
  variant?: Variant;
  'data-testid'?: string;
  'data-cy'?: string;
}

class Input extends PureComponent<InputProps> {
  handleOnChange = (event: FormEvent<HTMLInputElement>) => {
    const { maxCharCount, onChange, locale } = this.props;

    if (
      !maxCharCount ||
      lodashSize(event.currentTarget.value) <= maxCharCount
    ) {
      if (onChange) {
        onChange(event.currentTarget.value, locale);
      }
    }
  };

  handleOnBlur = (event: FormEvent<HTMLInputElement>) => {
    const { onBlur } = this.props;

    if (onBlur) {
      onBlur(event);
    }
  };

  render() {
    const {
      label,
      labelTooltipText,
      labelTooltipPlacement,
      ariaLabel,
      a11yCharactersLeftMessage,
      className,
      onKeyDown,
      ariaInvalid,
      ariaDescribedBy,
    } = this.props;
    const {
      id,
      type,
      name,
      maxCharCount,
      min,
      max,
      step,
      autoFocus,
      onFocus,
      disabled,
      spellCheck,
      readOnly,
      required,
      autocomplete,
      size = 'medium',
      variant = 'default',
      'data-testid': dataTestId,
      'data-cy': dataCy,
      onChange,
      onMultilinePaste,
    } = this.props;
    const hasError = !isNil(this.props.error) && !isEmpty(this.props.error);
    const optionalProps = isBoolean(spellCheck) ? { spellCheck } : null;
    const value = !isNil(this.props.value) ? this.props.value : '';
    const placeholder = this.props.placeholder || '';
    const error = this.props.error || null;
    const currentCharCount = maxCharCount && lodashSize(value);
    const tooManyChars = !!(
      maxCharCount &&
      currentCharCount &&
      currentCharCount > maxCharCount
    );

    return (
      <Container
        className={className || ''}
        size={size}
        variant={variant}
        data-testid={dataTestId}
        data-cy={dataCy}
      >
        {label && (
          <Label htmlFor={id}>
            <span>{label}</span>
            {labelTooltipText && (
              <IconTooltip
                content={labelTooltipText}
                placement={labelTooltipPlacement}
              />
            )}
          </Label>
        )}

        <StyledInput
          aria-label={ariaLabel}
          id={id}
          className={`
            ${maxCharCount && 'hasMaxCharCount'}
            ${hasError ? 'error' : ''}
          `}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={this.handleOnChange}
          onFocus={onFocus}
          onBlur={this.handleOnBlur}
          ref={this.props.setRef}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autocomplete}
          onKeyDown={onKeyDown}
          onPaste={
            onMultilinePaste
              ? (e) => {
                  e.preventDefault();
                  navigator.clipboard.readText().then((text) => {
                    const split = text.split('\n');

                    if (split.length === 1) {
                      onChange?.(split[0], this.props.locale);
                    } else {
                      onMultilinePaste(split);
                    }
                  });
                }
              : undefined
          }
          {...optionalProps}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
        />

        {maxCharCount && (
          <>
            {a11yCharactersLeftMessage && (
              <ScreenReaderOnly aria-live="polite">
                {a11yCharactersLeftMessage}
              </ScreenReaderOnly>
            )}
            <CharCount
              className={`${tooManyChars && 'error'}`}
              aria-hidden
              inputSize={size}
            >
              {currentCharCount}/{maxCharCount}
            </CharCount>
          </>
        )}

        <Error className="e2e-input-error" text={error} />
      </Container>
    );
  }
}

export default Input;
