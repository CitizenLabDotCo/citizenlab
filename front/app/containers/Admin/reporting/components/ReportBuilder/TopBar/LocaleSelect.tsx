import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

const StyledSelect = styled.select`
  background: ${colors.background};
  padding: 4px 0px 4px 0px;
  color: ${colors.textPrimary};
  cursor: pointer;
`;

interface Props {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

const LocaleSelect = ({ locale, setLocale }: Props) => {
  const locales = useAppConfigurationLocales();
  if (!locales) return null;

  return (
    <Box bgColor={colors.background} p="4px 8px 4px 8px" borderRadius="3px">
      <StyledSelect
        id="e2e-locale-select"
        value={locale}
        onChange={(e) => {
          setLocale(e.target.value as SupportedLocale);
        }}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {locale.toUpperCase()}
          </option>
        ))}
      </StyledSelect>
    </Box>
  );
};

export default LocaleSelect;
