import React, { PureComponent, FormEvent, KeyboardEvent } from 'react';

import { isNil, isEmpty, size as lodashSize, isBoolean } from 'lodash-es';
import styled from 'styled-components';

import { ScreenReaderOnly } from '../../utils/a11y';
import {
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

interface ContainerProps {
  size: InputSize;
}

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
  }
`;

export interface InputProps {
  ariaLabel?: string;
  id?: string;
  label?: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
  value?: string | null;
  locale?: Locale;
  type: 'text' | 'email' | 'password' | 'number' | 'date';
  placeholder?: string | null;
  error?: string | null;
  onChange?: (arg: string, locale: Locale | undefined) => void;
  onFocus?: (arg: FormEvent<HTMLInputElement>) => void;
  onBlur?: (arg: FormEvent<HTMLInputElement>) => void;
  setRef?: (arg: HTMLInputElement) => void | undefined;
  onKeyDown?: (event: KeyboardEvent) => void;
  autoFocus?: boolean;
  min?: string;
  max?: string;
  name?: string;
  maxCharCount?: number;
  disabled?: boolean;
  spellCheck?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autocomplete?:
    | 'email'
    | 'given-name'
    | 'family-name'
    | 'current-password'
    | 'new-password'
    | 'off'
    | 'on'; // https://www.w3.org/TR/WCAG21/#input-purposes
  a11yCharactersLeftMessage?: string;
  className?: string;
  size?: InputSize;
  'data-testid'?: string;
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

  handleRef = (element: HTMLInputElement) => {
    this.props.setRef && this.props.setRef(element);
  };

  render() {
    const {
      label,
      labelTooltipText,
      ariaLabel,
      a11yCharactersLeftMessage,
      className,
      onKeyDown,
    } = this.props;
    const {
      id,
      type,
      name,
      maxCharCount,
      min,
      max,
      autoFocus,
      onFocus,
      disabled,
      spellCheck,
      readOnly,
      required,
      autocomplete,
      size = 'medium',
      'data-testid': dataTestId,
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
        data-testid={dataTestId}
      >
        {label && (
          <Label htmlFor={id}>
            <span>{label}</span>
            {labelTooltipText && <IconTooltip content={labelTooltipText} />}
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
          ref={this.handleRef}
          min={min}
          max={max}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autocomplete}
          onKeyDown={onKeyDown}
          {...optionalProps}
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
