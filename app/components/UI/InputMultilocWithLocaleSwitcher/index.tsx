import React, { memo, useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Input, { Props as InputProps } from 'components/UI/Input';
import Label from 'components/UI/Label';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import IconTooltip from 'components/UI/IconTooltip';

// hooks
import useTenant from 'hooks/useTenant';

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

const StyledFormLocaleSwitcher = styled(FormLocaleSwitcher)`
  width: auto;
`;

export interface Props extends Omit<InputProps, 'value' | 'onChange'> {
  valueMultiloc: Multiloc | null | undefined;
  onChange?: (value: Multiloc) => void;
  onSelectedLocaleChange?: (locale: Locale) => void;
}

const InputMultilocWithLocaleSwitcher = memo<Props>((props) => {
  const {
    valueMultiloc,
    onChange,
    onSelectedLocaleChange,
    label,
    labelTooltipText,
    ...inputProps
  } = props;
  const { id, className } = props;

  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  const tenant = useTenant();
  const tenantLocales = !isNilOrError(tenant)
    ? tenant.data.attributes.settings.core.locales
    : null;

  useEffect(() => {
    const newSelectedLocale =
      tenantLocales && tenantLocales.length > 0 ? tenantLocales[0] : null;
    setSelectedLocale(newSelectedLocale);
    onSelectedLocaleChange &&
      newSelectedLocale &&
      onSelectedLocaleChange(newSelectedLocale);
  }, [tenantLocales, onSelectedLocaleChange]);

  const handleValueOnChange = useCallback(
    (value: string) => {
      if (onChange && !isNilOrError(selectedLocale)) {
        onChange({
          ...valueMultiloc,
          [selectedLocale]: value,
        });
      }
    },
    [valueMultiloc, selectedLocale, onChange]
  );

  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: Locale) => {
      setSelectedLocale(newSelectedLocale);
      onSelectedLocaleChange && onSelectedLocaleChange(newSelectedLocale);
    },
    [onSelectedLocaleChange]
  );

  if (selectedLocale) {
    return (
      <Container className={className}>
        <LabelContainer>
          {label ? (
            <StyledLabel htmlFor={id}>
              <span>{label}</span>
              {labelTooltipText && <IconTooltip content={labelTooltipText} />}
            </StyledLabel>
          ) : (
            <Spacer />
          )}

          <StyledFormLocaleSwitcher
            onLocaleChange={handleOnSelectedLocaleChange}
            selectedLocale={selectedLocale}
            values={{
              input_field: valueMultiloc as Multiloc,
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
