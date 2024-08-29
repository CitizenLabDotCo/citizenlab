import React, { PureComponent } from 'react';

// components
import styled from 'styled-components';

import { isNilOrError } from '../../utils/helperUtils';
import { Locale, Multiloc } from '../../utils/typings';
import IconTooltip from '../IconTooltip';
import Label from '../Label';

import Input, { InputProps } from '.';

const Container = styled.div``;

const InputWrapper = styled.div`
  &:not(.last) {
    margin-bottom: 10px;
  }
`;

const LanguageExtension = styled.span`
  font-weight: 500;
`;

export interface Props
  extends Omit<InputProps, 'value' | 'onChange' | 'error'> {
  valueMultiloc: Multiloc | null | undefined;
  locales: Locale[];
  errorMultiloc?: Multiloc | null;
  onChange?: (arg: Multiloc, locale: Locale) => void;
}

class InputMultiloc extends PureComponent<Props> {
  handleOnChange = (value: string, locale: Locale | undefined) => {
    if (locale && this.props.onChange) {
      this.props.onChange(
        {
          ...this.props.valueMultiloc,
          [locale]: value,
        },
        locale
      );
    }
  };

  render() {
    const {
      id,
      valueMultiloc,
      label,
      labelTooltipText,
      onBlur,
      type,
      placeholder,
      errorMultiloc,
      maxCharCount,
      disabled,
      ariaLabel,
      className,
      locales,
    } = this.props;

    if (!isNilOrError(locales)) {
      return (
        <Container id={id} className={`${className || ''} e2e-multiloc-input`}>
          {locales.map((locale, index) => {
            const value = valueMultiloc?.[locale] || null;
            const error = errorMultiloc?.[locale] || null;
            const inputId = id && `${id}-${locale}`;

            return (
              <InputWrapper
                key={locale}
                className={`${index === locales.length - 1 && 'last'}`}
              >
                {label && (
                  <Label htmlFor={inputId}>
                    <span>{label}</span>
                    {locales.length > 1 && (
                      <LanguageExtension>
                        {locale.toUpperCase()}
                      </LanguageExtension>
                    )}
                    {labelTooltipText && (
                      <IconTooltip content={labelTooltipText} />
                    )}
                  </Label>
                )}

                <Input
                  id={inputId}
                  value={value}
                  locale={locale}
                  type={type}
                  placeholder={placeholder}
                  error={error}
                  onChange={this.handleOnChange}
                  onBlur={onBlur}
                  maxCharCount={maxCharCount}
                  disabled={disabled}
                  ariaLabel={ariaLabel}
                />
              </InputWrapper>
            );
          })}
        </Container>
      );
    }

    return null;
  }
}

export default InputMultiloc;
