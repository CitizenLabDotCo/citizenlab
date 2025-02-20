import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { setRansackParam, useRansackParam } from './utils';

type Option = {
  value: string;
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
      onChange={(option: Option) =>
        setRansackParam('q[topic_id_eq]', option.value)
      }
      label="Topic"
    />
  );
};

export default Topic;
