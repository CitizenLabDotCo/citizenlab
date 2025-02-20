import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { updateOrRemoveSearchParam } from './utils';

type Option = {
  value: RansackParams['q[status_eq]'];
  label: string;
};

const OPTIONS: Option[] = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
  { value: 'draft', label: 'Draft' },
  { value: 'finished', label: 'Finished' },
  { value: 'stale', label: 'Stale' },
];

const Status = () => {
  return (
    <Select
      options={OPTIONS}
      onChange={(option: Option) =>
        updateOrRemoveSearchParam('q[status_eq]', option.value)
      }
      label="Status"
    />
  );
};

export default Status;
