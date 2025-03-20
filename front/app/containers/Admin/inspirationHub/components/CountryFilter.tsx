import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

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
    <Select
      value={value}
      options={options ?? []}
      canBeEmpty
      onChange={onChange}
      placeholder={formatMessage(placeholderMessage)}
      mr="28px"
    />
  );
};

export default CountryFilter;
