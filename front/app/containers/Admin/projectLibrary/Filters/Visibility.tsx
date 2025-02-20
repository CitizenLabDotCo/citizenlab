import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { setRansackParam, useRansackParam, EMPTY_OPTION } from './utils';

type Option = {
  value: RansackParams['q[visibility_eq]'];
  label: string;
};

const OPTIONS: Option[] = [
  EMPTY_OPTION,
  { value: 'public', label: 'Public' },
  { value: 'restricted', label: 'Restricted' },
];

const Visibility = () => {
  const value = useRansackParam('q[visibility_eq]');

  return (
    <Select
      value={value}
      options={OPTIONS}
      onChange={(option: Option) =>
        setRansackParam('q[visibility_eq]', option.value)
      }
      label="Visibility"
    />
  );
};

export default Visibility;
