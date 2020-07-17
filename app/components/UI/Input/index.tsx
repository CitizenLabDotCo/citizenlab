import React from 'react';
import { isNil, isEmpty, size } from 'lodash-es';

// components
import Error from 'components/UI/Error';
import Label from 'components/UI/Label';
import IconTooltip from 'components/UI/IconTooltip';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isPage } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { colors, fontSizes, defaultInputStyle } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { isBoolean } from 'util';

// typings
import { Locale } from 'typings';

const Container = styled.div`
  width: 100%;
  position: relative;

  input {
    ${defaultInputStyle};
    width: 100%;

    &.hasMaxCharCount {
      padding-right: 62px;
    }
  }
`;

const CharCount = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  text-align: right;
  position: absolute;
  bottom: 14px;
  right: 10px;

  &.error {
    color: red;
  }
`;

export type Props = {
  ariaLabel?: string;
  id?: string | undefined;
  label?: string | JSX.Element | null | undefined;
  labelTooltipText?: string | JSX.Element | null;
  value?: string | null | undefined;
  locale?: Locale;
  type: 'text' | 'email' | 'password' | 'number' | 'date';
  placeholder?: string | null | undefined;
  error?: string | JSX.Element | null | undefined;
  onChange?: (arg: string, locale: Locale | undefined) => void;
  onFocus?: (arg: React.FormEvent<HTMLInputElement>) => void;
  onBlur?: (arg: React.FormEvent<HTMLInputElement>) => void;
  setRef?: (arg: HTMLInputElement) => void | undefined;
  autoFocus?: boolean | undefined;
  min?: string | undefined;
  name?: string | undefined;
  maxCharCount?: number | undefined;
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
  className?: string;
};

export class Input extends React.PureComponent<Props> {
  handleOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { maxCharCount, onChange, locale } = this.props;

    if (!maxCharCount || size(event.currentTarget.value) <= maxCharCount) {
      if (onChange) {
        onChange(event.currentTarget.value, locale);
      }
    }
  };

  handleOnBlur = (event: React.FormEvent<HTMLInputElement>) => {
    const { onBlur } = this.props;

    if (onBlur) {
      onBlur(event);
    }
  };

  handleRef = (element: HTMLInputElement) => {
    this.props.setRef && this.props.setRef(element);
  };

  render() {
    const { label, labelTooltipText, ariaLabel, className } = this.props;
    const {
      id,
      type,
      name,
      maxCharCount,
      min,
      autoFocus,
      onFocus,
      disabled,
      spellCheck,
      readOnly,
      required,
      autocomplete,
    } = this.props;
    const hasError = !isNil(this.props.error) && !isEmpty(this.props.error);
    const optionalProps = isBoolean(spellCheck) ? { spellCheck } : null;
    const value = this.props.value || '';
    const placeholder = this.props.placeholder || '';
    const error = this.props.error || null;
    const currentCharCount = maxCharCount && size(value);
    const tooManyChars = !!(
      maxCharCount &&
      currentCharCount &&
      currentCharCount > maxCharCount
    );
    const adminPage = isPage('admin', location.pathname);

    return (
      <Container className={className || ''}>
        {label && (
          <Label htmlFor={id}>
            <span>{label}</span>
            {labelTooltipText && <IconTooltip content={labelTooltipText} />}
          </Label>
        )}

        <input
          aria-label={ariaLabel}
          id={id}
          className={`
            ${maxCharCount && 'hasMaxCharCount'}
            ${adminPage ? 'admin' : ''}
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
          autoFocus={autoFocus}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autocomplete}
          {...optionalProps}
        />

        {maxCharCount && (
          <>
            <ScreenReaderOnly aria-live="polite">
              <FormattedMessage
                {...messages.a11y_charactersLeft}
                values={{
                  currentCharCount,
                  maxCharCount,
                }}
              />
            </ScreenReaderOnly>
            <CharCount className={`${tooManyChars && 'error'}`} aria-hidden>
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
