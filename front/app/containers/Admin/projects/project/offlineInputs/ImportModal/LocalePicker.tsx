import React from 'react';

// api
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Select from 'components/HookForm/Select';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const LocalePicker = () => {
  const locales = useAppConfigurationLocales();
  if (!locales) return null;

  const options = locales.map((locale) => ({
    value: locale,
    label: locale,
  }));

  return (
    <Box w="100%" maxWidth="300px" mb="20px">
      <Select
        name="locale"
        label={<FormattedMessage {...messages.formLanguage} />}
        options={options}
      />
    </Box>
  );
};

export default LocalePicker;
