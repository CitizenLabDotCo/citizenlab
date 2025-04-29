import React, { memo, useState, useCallback, useEffect } from 'react';

import styled from 'styled-components';

import { isNilOrError } from '../../utils/helperUtils';
import { Locale, Multiloc } from '../../utils/typings';
import Box from '../Box';
import IconTooltip from '../IconTooltip';
import Label from '../Label';
import LocaleSwitcher from '../LocaleSwitcher';

import Input, { InputProps } from '.';

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
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
  locales: Locale[];
  onChange?: (value: Multiloc, locale?: Locale) => void;
  onSelectedLocaleChange?: (locale: Locale) => void;
  errorMultiloc?: Multiloc | null;
  initiallySelectedLocale?: Locale;
  hideLocaleSwitcher?: boolean;
}

const InputMultilocWithLocaleSwitcher = memo<Props>((props) => {
  const {
    valueMultiloc,
    locales,
    onChange,
    onSelectedLocaleChange,
    label,
    labelTooltipText,
    errorMultiloc,
    initiallySelectedLocale,
    hideLocaleSwitcher,
    ...inputProps
  } = props;
  const { id, className } = props;
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(
    initiallySelectedLocale ? initiallySelectedLocale : locales[0]
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (errorMultiloc) {
      const localesWithError = Object.keys(errorMultiloc).filter((locale) => {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const errorForLocale = errorMultiloc?.[locale];
        return (
          errorForLocale &&
          typeof errorForLocale === 'string' &&
          errorForLocale.length > 0
        );
      });

      if (localesWithError.length > 0) {
        const firstLocaleWithError = localesWithError[0];
        const firstError = errorMultiloc[firstLocaleWithError] as string;
        setError(firstError);
        setSelectedLocale(firstLocaleWithError);
      }
    } else {
      setError(null);
    }
  }, [errorMultiloc]);

  const handleValueOnChange = useCallback(
    (value: string) => {
      if (onChange && !isNilOrError(selectedLocale)) {
        onChange(
          {
            ...valueMultiloc,
            [selectedLocale]: value,
          },
          selectedLocale
        );
      }
    },
    [valueMultiloc, selectedLocale, onChange]
  );

  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: Locale) => {
      setSelectedLocale(newSelectedLocale);
      onSelectedLocaleChange?.(newSelectedLocale);
    },
    [onSelectedLocaleChange]
  );

  if (selectedLocale) {
    return (
      <Box className={className}>
        <Box mb="10px">
          <LabelContainer>
            {label ? (
              <StyledLabel htmlFor={id}>
                <span>{label}</span>
                {labelTooltipText && <IconTooltip content={labelTooltipText} />}
              </StyledLabel>
            ) : (
              <Spacer />
            )}
            {!hideLocaleSwitcher && (
              <StyledLocaleSwitcher
                onSelectedLocaleChange={handleOnSelectedLocaleChange}
                locales={!isNilOrError(locales) ? locales : []}
                selectedLocale={selectedLocale}
                values={{
                  input_field: valueMultiloc as Multiloc,
                }}
              />
            )}
          </LabelContainer>
        </Box>
        <Input
          {...inputProps}
          value={valueMultiloc?.[selectedLocale] || null}
          onChange={handleValueOnChange}
          error={error}
        />
      </Box>
    );
  }

  return null;
});

export default InputMultilocWithLocaleSwitcher;
