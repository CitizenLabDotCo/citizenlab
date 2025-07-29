import React from 'react';

import { Discoverability } from 'api/projects_mini_admin/types';

import FilterSelector from 'components/FilterSelector';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { useParam, setParam } from '../../params';

const OPTIONS: {
  value: Discoverability;
  message: MessageDescriptor;
}[] = [
  {
    value: 'listed',
    message: messages.discoverabilityPublic,
  },
  {
    value: 'unlisted',
    message: messages.discoverabilityHidden,
  },
];

const DiscoverabilityFilter = () => {
  const value = useParam('discoverability') ?? [];
  const { formatMessage } = useIntl();

  const options = OPTIONS.map((option) => ({
    text: formatMessage(option.message),
    value: option.value,
  }));

  return (
    <FilterSelector
      title={formatMessage(messages.discoverabilityLabel)}
      name="discoverability-filter"
      values={options}
      selected={value}
      onChange={(discoverability) => {
        setParam('discoverability', discoverability as Discoverability[]);
      }}
      multipleSelectionAllowed
    />
  );
};

export default DiscoverabilityFilter;
