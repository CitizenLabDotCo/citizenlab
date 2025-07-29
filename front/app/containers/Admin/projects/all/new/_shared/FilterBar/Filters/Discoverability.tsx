import React from 'react';

import FilterSelector from 'components/FilterSelector';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../messages';

const OPTIONS: {
  value: 'listed' | 'unlisted';
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

interface Props {
  value: ('listed' | 'unlisted')[];
  onChange: (value: ('listed' | 'unlisted')[]) => void;
}

const DiscoverabilityFilter = ({ value, onChange }: Props) => {
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
      onChange={onChange}
      multipleSelectionAllowed
    />
  );
};

export default DiscoverabilityFilter;
