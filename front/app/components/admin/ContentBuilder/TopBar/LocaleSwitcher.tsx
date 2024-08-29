import React from 'react';

import {
  Box,
  LocaleSwitcher as LocaleSwitcherComponent,
  colors,
} from '@citizenlab/cl2-component-library';
import { SupportedLocale } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { isNilOrError } from 'utils/helperUtils';

interface Props {
  selectedLocale: SupportedLocale | undefined;
  localesWithError?: SupportedLocale[];
  onSelectLocale: (locale: SupportedLocale) => void;
}

const LocaleSwitcher = ({
  selectedLocale,
  localesWithError,
  onSelectLocale,
}: Props) => {
  const locales = useAppConfigurationLocales();

  if (isNilOrError(locales) || locales.length <= 1 || !selectedLocale) {
    return null;
  }

  const localesValues = locales.reduce((acc, locale) => {
    return {
      ...acc,
      [locale]: localesWithError?.includes(locale) ? '' : 'NON-EMPTY-VALUE',
    };
  }, {});

  return (
    <Box
      borderLeft={`1px solid ${colors.divider}`}
      borderRight={`1px solid ${colors.divider}`}
      h="100%"
      p="24px"
    >
      <LocaleSwitcherComponent
        data-testid="contentBuilderLocaleSwitcher"
        locales={locales}
        selectedLocale={selectedLocale}
        onSelectedLocaleChange={onSelectLocale}
        values={{ localesValues }}
      />
    </Box>
  );
};

export default LocaleSwitcher;
