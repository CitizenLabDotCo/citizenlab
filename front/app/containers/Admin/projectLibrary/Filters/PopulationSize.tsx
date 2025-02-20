import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { updateOrRemoveSearchParam } from './utils';

type Option = {
  value: RansackParams['q[tenant_population_group_eq]'];
  label: string;
};

const OPTIONS: Option[] = [
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

const PopulationSize = () => {
  return (
    <Select
      options={OPTIONS}
      onChange={(option: Option) =>
        updateOrRemoveSearchParam('q[tenant_population_group_eq]', option.value)
      }
      label="Population size"
    />
  );
};

export default PopulationSize;
