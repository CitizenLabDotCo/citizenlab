import React from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';

import useProjectLibraryCountries from 'api/project_library_countries/useProjectLibraryCountries';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

type Option = {
  value?: string;
  label: string;
};

interface Props {
  value?: string;
  placeholderMessage: MessageDescriptor;
  onChange: (option: Option) => void;
}

const CountryFilter = ({ value, placeholderMessage, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const { data: countries } = useProjectLibraryCountries();

  const options = countries?.data.attributes.map(
    ({ code, name, emoji_flag }) => ({
      value: code,
      label: `${emoji_flag} ${name}`,
    })
  );

  return (
    <Box>
      <Select
        value={value}
        options={options ?? []}
        canBeEmpty
        onChange={onChange}
        placeholder={formatMessage(placeholderMessage)}
        mr="28px"
      />
    </Box>
  );
};

export default CountryFilter;
