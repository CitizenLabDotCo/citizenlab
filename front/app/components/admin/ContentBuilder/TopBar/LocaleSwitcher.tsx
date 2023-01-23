import React from 'react';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// components
import {
  Box,
  LocaleSwitcher as LocaleSwitcherComponent,
} from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Locale } from 'typings';

interface Props {
  selectedLocale: Locale | undefined;
  localesWithError: Locale[];
  onSelectLocale: (locale: Locale) => void;
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
      [locale]: localesWithError.includes(locale) ? '' : 'NON-EMPTY-VALUE',
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
