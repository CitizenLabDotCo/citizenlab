import React, { memo, useState, useCallback, useEffect } from 'react';

import styled, { css } from 'styled-components';

import { isNilOrError } from '../../utils/helperUtils';
import { colors, fontSizes } from '../../utils/styleUtils';
import { Locale, Multiloc } from '../../utils/typings';
import Box from '../Box';
import IconTooltip from '../IconTooltip';
import Label from '../Label';
import LocaleSwitcher from '../LocaleSwitcher';

import Input, { InputProps } from '.';

export const stackedLabelStyle = css`
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  > label {
    align-self: flex-start;
  }
`;

const LabelContainer = styled.div<{ stacked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  ${({ stacked }) => stacked && stackedLabelStyle}
`;

export const boLabelStyle = css`
  margin-bottom: 0;
  font-size: ${fontSizes.xs}px;
  line-height: 1.4;
  color: ${colors.coolGrey600};
`;

const StyledLabel = styled(Label)<{ variant: InputProps['variant'] }>`
  flex: 1;
  padding-bottom: 0px;

  ${({ variant }) => variant === 'bo' && boLabelStyle}
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
  stackedLabel?: boolean;
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
    stackedLabel = false,
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
        <Box mb={props.variant === 'bo' ? '4px' : '10px'}>
          <LabelContainer stacked={stackedLabel}>
            {label ? (
              <StyledLabel htmlFor={id} variant={props.variant}>
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
                variant={props.variant}
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
