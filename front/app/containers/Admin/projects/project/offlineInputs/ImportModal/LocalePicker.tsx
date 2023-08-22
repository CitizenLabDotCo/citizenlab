import React from 'react';

// api
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { IOption, Locale } from 'typings';

interface Props {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

const LocalePicker = ({ locale, onChange }: Props) => {
  const locales = useAppConfigurationLocales();
  if (!locales) return null;

  const options = locales.map((locale) => ({
    value: locale,
    label: locale,
  }));

  const handleChange = (option: IOption) => {
    onChange(option.value);
  };

  return (
    <Box w="100%" maxWidth="300px" mb="20px">
      <Select
        label={<FormattedMessage {...messages.formLanguage} />}
        value={locale}
        options={options}
        onChange={handleChange}
      />
    </Box>
  );
};

export default LocalePicker;
