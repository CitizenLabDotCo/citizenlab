import React, { memo, useState, useCallback, useEffect } from 'react';
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

const LabelWrapper = styled.div`
  display: flex;
`;

interface Props {
  id?: string | undefined;
  valueMultiloc: Multiloc | null | undefined;
  label?: string | JSX.Element | null | undefined;
  onChange?: (arg: Multiloc, locale: Locale) => void;
  onBlur?: (arg: React.FormEvent<HTMLInputElement>) => void;
  type: 'text' | 'email' | 'password' | 'number';
  placeholder?: string | null | undefined;
  errorMultiloc?: Multiloc | null;
  maxCharCount?: number | undefined;
  disabled?: boolean;
  ariaLabel?: string;
  setRef?: (arg: HTMLInputElement) => void | undefined;
  autoFocus?: boolean;
  className?: string;
}

const InputMultilocWithLocaleSwitcher = memo<Props>(({
  id,
  valueMultiloc,
  label,
  onChange,
  onBlur,
  type,
  placeholder,
  errorMultiloc,
  maxCharCount,
  disabled,
  ariaLabel,
  setRef,
  autoFocus,
  className
}) => {

  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  const tenant = useTenant();
  const tenantLocales = !isNilOrError(tenant) ? tenant.data.attributes.settings.core.locales : null;

  useEffect(() => {
    setSelectedLocale(tenantLocales && tenantLocales.length > 0 ? tenantLocales[0] : null);
  }, [tenantLocales]);

  const handleOnChange = useCallback((value: string) => {
    if (onChange && !isNilOrError(selectedLocale)) {
      onChange({
        ...valueMultiloc,
        [selectedLocale]: value
      }, selectedLocale);
    }
  }, [valueMultiloc, selectedLocale]);

  const handleOnSelectedLocaleChange = useCallback((newSelectedLocale: Locale) => {
    setSelectedLocale(newSelectedLocale);
  }, []);

  const handleOnBlur = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    onBlur && onBlur(event);
  }, []);

  return (
    <Container className={className}>
      {selectedLocale &&
        <FormLocaleSwitcher
          onLocaleChange={handleOnSelectedLocaleChange}
          selectedLocale={selectedLocale}
          values={{
            input_field: valueMultiloc as Multiloc
          }}
        />
      }

      {label &&
        <LabelWrapper>
          <Label htmlFor={id}>{label}</Label>
        </LabelWrapper>
      }

      <Input
        setRef={setRef}
        id={id}
        value={get(valueMultiloc, `${selectedLocale}`, null)}
        type={type}
        placeholder={placeholder}
        error={get(errorMultiloc, `${selectedLocale}`, null)}
        onChange={handleOnChange}
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
