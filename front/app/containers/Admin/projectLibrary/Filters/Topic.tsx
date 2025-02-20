import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { RansackParams } from 'api/project_library_projects/types';

import { setRansackParam, useRansackParam } from './utils';

type Option = {
  value: RansackParams['q[topic_id_eq]'];
  label: string;
};

const OPTIONS: Option[] = [
  { value: 'some_topic', label: 'Some topic' },
  { value: 'another_topic', label: 'Another topic' },
];

const Topic = () => {
  const value = useRansackParam('q[topic_id_eq]');

  return (
    <Select
      value={value}
      options={OPTIONS}
      canBeEmpty
      onChange={(option: Option) =>
        setRansackParam('q[topic_id_eq]', option.value)
      }
      label="Topic"
    />
  );
};

export default Topic;
