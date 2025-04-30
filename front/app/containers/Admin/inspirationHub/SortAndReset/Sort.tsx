import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { useRansackParam, setRansackParam } from '../utils';

import messages from './messages';

type Option = {
  value:
    | 'start_at asc'
    | 'start_at desc'
    | 'participants asc'
    | 'participants desc';
  label: string;
};

const OPTIONS = [
  { value: 'start_at asc', message: messages.start_at_asc },
  { value: 'start_at desc', message: messages.start_at_desc },
  { value: 'participants asc', message: messages.participants_asc },
  { value: 'participants desc', message: messages.participants_desc },
] as const;

const Sort = () => {
  const { formatMessage } = useIntl();
  const sortValue = useRansackParam('q[s]');

  const options: Option[] = OPTIONS.map(({ value, message }) => ({
    value,
    label: formatMessage(message),
  }));

  return (
    <Select
      value={sortValue}
      options={options}
      canBeEmpty
      onChange={(option: Option) => setRansackParam('q[s]', option.value)}
      placeholder={formatMessage(messages.sortBy)}
      mr="28px"
    />
  );
};

export default Sort;
