import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { updateOrRemoveSearchParam } from './utils';

type Option = {
  value: string;
  label: string;
};

const OPTIONS: Option[] = [
  { value: 'some_topic', label: 'Some topic' },
  { value: 'another_topic', label: 'Another topic' },
];

const Topic = () => {
  return (
    <Select
      options={OPTIONS}
      onChange={(option: Option) =>
        updateOrRemoveSearchParam('q[topic_id_eq]', option.value)
      }
      label="Topic"
    />
  );
};

export default Topic;
