import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { updateOrRemoveSearchParam } from './utils';

type Option = {
  value: RansackParams['q[visibility_eq]'];
  label: string;
};

const OPTIONS: Option[] = [
  { value: 'public', label: 'Public' },
  { value: 'restricted', label: 'Restricted' },
];

const Visibility = () => {
  return (
    <Select
      options={OPTIONS}
      onChange={(option: Option) =>
        updateOrRemoveSearchParam('q[visibility_eq]', option.value)
      }
      label="Visibility"
    />
  );
};

export default Visibility;
