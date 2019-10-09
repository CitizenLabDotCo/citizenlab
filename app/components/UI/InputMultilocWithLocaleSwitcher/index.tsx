import React, { memo, useState, useCallback, useEffect, FormEvent } from 'react';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Input from 'components/UI/Input';
import Label from 'components/UI/Label';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';

// hooks
import useTenant from 'hooks/useTenant';

// style
import styled from 'styled-components';

// typings
import { Locale, Multiloc } from 'typings';

const Container = styled.div``;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
`;

const StyledLabel = styled(Label)`
  flex: 1;
  padding-bottom: 0px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const StyledFormLocaleSwitcher = styled(FormLocaleSwitcher)`
  width: auto;
`;

interface Props {
  id?: string | undefined;
  valueMultiloc: Multiloc | null | undefined;
  label?: string | JSX.Element | null | undefined;
  onValueChange?: (value: Multiloc) => void;
  onSelectedLocaleChange?: (locale: Locale) => void;
  onBlur?: (event: FormEvent<HTMLInputElement>) => void;
  type: 'text' | 'email' | 'password' | 'number';
  placeholder?: string | null | undefined;
  errorMultiloc?: Multiloc | null;
  maxCharCount?: number | undefined;
  disabled?: boolean;
  ariaLabel?: string;
  ref?: (arg: HTMLInputElement) => void | undefined;
  autoFocus?: boolean;
  className?: string;
}

const InputMultilocWithLocaleSwitcher = memo<Props>(({
  id,
  valueMultiloc,
  label,
  onValueChange,
  onSelectedLocaleChange,
  onBlur,
  type,
  placeholder,
  errorMultiloc,
  maxCharCount,
  disabled,
  ariaLabel,
  ref,
  autoFocus,
  className
}) => {

  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  const tenant = useTenant();
  const tenantLocales = !isNilOrError(tenant) ? tenant.data.attributes.settings.core.locales : null;

  useEffect(() => {
    const newSelectedLocale = tenantLocales && tenantLocales.length > 0 ? tenantLocales[0] : null;
    setSelectedLocale(newSelectedLocale);
    onSelectedLocaleChange && newSelectedLocale && onSelectedLocaleChange(newSelectedLocale);
  }, [tenantLocales]);

  const handleValueOnChange = useCallback((value: string) => {
    if (onValueChange && !isNilOrError(selectedLocale)) {
      onValueChange({
        ...valueMultiloc,
        [selectedLocale]: value
      });
    }
  }, [valueMultiloc, selectedLocale]);

  const handleOnSelectedLocaleChange = useCallback((newSelectedLocale: Locale) => {
    setSelectedLocale(newSelectedLocale);
    onSelectedLocaleChange && onSelectedLocaleChange(newSelectedLocale);
  }, []);

  const handleOnBlur = useCallback((event: FormEvent<HTMLInputElement>) => {
    onBlur && onBlur(event);
  }, []);

  return (
    <Container className={className}>
      <Wrapper>
        {label ? <StyledLabel htmlFor={id}>{label}</StyledLabel> : <Spacer />}

        {selectedLocale &&
          <StyledFormLocaleSwitcher
            onLocaleChange={handleOnSelectedLocaleChange}
            selectedLocale={selectedLocale}
            values={{
              input_field: valueMultiloc as Multiloc
            }}
          />
        }
      </Wrapper>

      <Input
        setRef={ref}
        id={id}
        value={get(valueMultiloc, `${selectedLocale}`, null)}
        type={type}
        placeholder={placeholder}
        error={get(errorMultiloc, `${selectedLocale}`, null)}
        onChange={handleValueOnChange}
        onBlur={handleOnBlur}
        maxCharCount={maxCharCount}
        disabled={disabled}
        ariaLabel={ariaLabel}
        autoFocus={autoFocus}
      />
    </Container>
  );
});

export default InputMultilocWithLocaleSwitcher;
