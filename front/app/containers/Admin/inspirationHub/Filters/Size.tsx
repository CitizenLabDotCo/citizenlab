import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { useIntl } from 'utils/cl-intl';

import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';

type Option = {
  value: RansackParams['q[tenant_population_group_eq]'];
  label: string;
};

const OPTIONS: Option[] = [
  { value: 'XL', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
];

const Size = () => {
  const { formatMessage } = useIntl();
  const value = useRansackParam('q[tenant_population_group_eq]');

  return (
    <Select
      value={value}
      options={OPTIONS}
      canBeEmpty
      onChange={(option: Option) =>
        setRansackParam('q[tenant_population_group_eq]', option.value)
      }
      placeholder={formatMessage(messages.size)}
      mr="28px"
    />
  );
};

export default Size;
