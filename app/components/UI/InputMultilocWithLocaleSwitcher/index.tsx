import React, { memo, useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Input, InputProps, IconTooltip, LocaleSwitcher } from 'cl2-component-library';
import Label from 'components/UI/Label';

// hooks
import useTenantLocales from 'hooks/useTenantLocales';

// style
import styled from 'styled-components';

// typings
import { Locale, Multiloc } from 'typings';

const Container = styled.div``;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StyledLabel = styled(Label)`
  flex: 1;
  padding-bottom: 0px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const StyledLocaleSwitcher = styled(LocaleSwitcher)`
  width: auto;
`;

export interface Props extends Omit<InputProps, 'value' | 'onChange'> {
  valueMultiloc: Multiloc | null | undefined;
  onChange?: (value: Multiloc) => void;
  onSelectedLocaleChange?: (locale: Locale) => void;
}

const InputMultilocWithLocaleSwitcher = memo<Props>((props) => {

  const { valueMultiloc, onChange, onSelectedLocaleChange, label, labelTooltipText, ...inputProps } = props;
  const { id, className } = props;

  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  const tenantLocales = useTenantLocales();

  useEffect(() => {
    const newSelectedLocale = !isNilOrError(tenantLocales) && tenantLocales.length > 0 ? tenantLocales[0] : null;
    setSelectedLocale(newSelectedLocale);
    onSelectedLocaleChange && newSelectedLocale && onSelectedLocaleChange(newSelectedLocale);
  }, [tenantLocales, onSelectedLocaleChange]);

  const handleValueOnChange = useCallback((value: string) => {
    if (onChange && !isNilOrError(selectedLocale)) {
      onChange({
        ...valueMultiloc,
        [selectedLocale]: value
      });
    }
  }, [valueMultiloc, selectedLocale, onChange]);

  const handleOnSelectedLocaleChange = useCallback((newSelectedLocale: Locale) => {
    setSelectedLocale(newSelectedLocale);
    onSelectedLocaleChange && onSelectedLocaleChange(newSelectedLocale);
  }, [onSelectedLocaleChange]);

  if (selectedLocale) {
    return (
      <Container className={className}>
        <LabelContainer>
          {label ? (
            <StyledLabel htmlFor={id}>
              <span>{label}</span>
              {labelTooltipText && <IconTooltip content={labelTooltipText} />}
            </StyledLabel>
          ) : <Spacer />}

          <StyledLocaleSwitcher
            onSelectedLocaleChange={handleOnSelectedLocaleChange}
            locales={!isNilOrError(tenantLocales) ? tenantLocales : []}
            selectedLocale={selectedLocale}
            values={{
              input_field: valueMultiloc as Multiloc
            }}
          />
        </LabelContainer>

        <Input
          {...inputProps}
          value={valueMultiloc?.[selectedLocale] || null}
          onChange={handleValueOnChange}
        />
      </Container>
    );
  }

  return null;
});

export default InputMultilocWithLocaleSwitcher;
