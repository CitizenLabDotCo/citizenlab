import React from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';

import useProjectLibraryCountries from 'api/project_library_countries/useProjectLibraryCountries';
import { RansackParams } from 'api/project_library_projects/types';

import { useIntl } from 'utils/cl-intl';

import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';

type Option = {
  value: RansackParams['q[tenant_country_alpha2]'];
  label: string;
};

const Country = () => {
  const { formatMessage } = useIntl();
  const value = useRansackParam('q[tenant_country_alpha2]');
  const { data: countries } = useProjectLibraryCountries();

  const options = countries?.data.attributes.map(({ code, short_name }) => ({
    value: code,
    label: short_name,
  }));

  return (
    <Box>
      <Select
        value={value}
        options={options ?? []}
        canBeEmpty
        onChange={(option: Option) =>
          setRansackParam('q[tenant_country_alpha2]', option.value)
        }
        placeholder={formatMessage(messages.country)}
        mr="28px"
      />
    </Box>
  );
};

export default Country;
