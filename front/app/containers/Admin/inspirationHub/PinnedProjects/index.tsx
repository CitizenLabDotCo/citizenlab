import React, { useEffect, useState } from 'react';

import { Box, Title, Select } from '@citizenlab/cl2-component-library';

import useProjectLibraryCountries from 'api/project_library_countries/useProjectLibraryCountries';

import useCountryCodeSupportedInProjectLibrary from 'hooks/useCountryCodeSupportedInProjectLibrary';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { useRansackParam, setRansackParam } from '../utils';

import Cards from './Cards';
import messages from './messages';

const PinnedProjects = () => {
  const countryCode = useRansackParam('q[pin_country_code_eq]');
  const { data: countries } = useProjectLibraryCountries();
  const { formatMessage } = useIntl();

  const options = countries?.data.attributes.map(
    ({ code, name, emoji_flag }) => ({
      value: code,
      label: `${emoji_flag} ${name}`,
    })
  );

  return (
    <>
      <Title variant="h2" color="primary" mt="0px">
        <FormattedMessage {...messages.highlighted} />
      </Title>
      <Box display="flex" mb="12px">
        <Select
          value={countryCode}
          options={options ?? []}
          canBeEmpty
          onChange={(option) => {
            setRansackParam('q[pin_country_code_eq]', option.value);
          }}
          placeholder={formatMessage(messages.country)}
          mr="28px"
        />
      </Box>
      <Cards />
    </>
  );
};

const PinnedProjectsWrapper = () => {
  const [initialCountryCodeSet, setInitialCountryCodeSet] = useState(false);
  const { status, countryCode } = useCountryCodeSupportedInProjectLibrary();

  useEffect(() => {
    if (initialCountryCodeSet) return;

    if (status === 'supported') {
      setRansackParam('q[pin_country_code_eq]', countryCode);
      setInitialCountryCodeSet(true);
    }
  }, [status, countryCode, initialCountryCodeSet]);

  if (status === 'loading') {
    return null;
  }

  // If the countryCode is supported, but the param is not set yet,
  // we wait for it to be set.
  if (status === 'supported' && !initialCountryCodeSet) {
    return null;
  }

  return <PinnedProjects />;
};

export default PinnedProjectsWrapper;
