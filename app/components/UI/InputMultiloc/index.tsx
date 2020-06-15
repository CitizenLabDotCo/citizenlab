import React, { PureComponent } from 'react';

// components
import Input from 'components/UI/Input';
import { Label } from 'cl2-component-library';
import IconTooltip from 'components/UI/IconTooltip';

// resources
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';

// typings
import { Locale, Multiloc } from 'typings';

const Container = styled.div``;

const InputWrapper = styled.div`
  &:not(.last) {
    margin-bottom: 10px;
  }
`;

const LanguageExtension = styled.span`
  font-weight: 500;
`;

export interface InputProps {
  id?: string | undefined;
  valueMultiloc: Multiloc | null | undefined;
  label?: string | JSX.Element | null | undefined;
  labelTooltipText?: string | JSX.Element | null;
  onChange?: (arg: Multiloc, locale: Locale) => void;
  onBlur?: (arg: React.FormEvent<HTMLInputElement>) => void;
  type: 'text' | 'email' | 'password' | 'number';
  placeholder?: string | null | undefined;
  errorMultiloc?: Multiloc | null;
  maxCharCount?: number | undefined;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {}

class InputMultiloc extends PureComponent<Props, State> {

  handleOnChange = (value: string, locale: Locale | undefined) => {
    if (locale && this.props.onChange) {
      this.props.onChange({
        ...this.props.valueMultiloc,
        [locale]: value
      }, locale);
    }
  }

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
      tenantLocales
    } = this.props;

    if (!isNilOrError(tenantLocales)) {
      return (
        <Container
          id={id}
          className={`${className || ''} e2e-multiloc-input`}
        >
          {tenantLocales.map((tenantLocale, index) => {
            const value = valueMultiloc?.[tenantLocale] || null;
            const error = errorMultiloc?.[tenantLocale] || null;
            const inputId = id && `${id}-${tenantLocale}`;

            return (
              <InputWrapper
                key={tenantLocale}
                className={`${index === tenantLocales.length - 1 && 'last'}`}
              >
                {label &&
                  <Label htmlFor={inputId}>
                    <span>{label}</span>
                    {tenantLocales.length > 1 && <LanguageExtension>{tenantLocale.toUpperCase()}</LanguageExtension>}
                    {labelTooltipText && <IconTooltip content={labelTooltipText} />}
                  </Label>
                }

                <Input
                  id={inputId}
                  value={value}
                  locale={tenantLocale}
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

export default (InputProps: InputProps) => (
  <GetTenantLocales>
    {tenantLocales => <InputMultiloc {...InputProps} tenantLocales={tenantLocales} />}
  </GetTenantLocales>
);
