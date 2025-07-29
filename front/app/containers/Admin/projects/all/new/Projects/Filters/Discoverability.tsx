import React from 'react';

import MultiSelect from 'components/UI/MultiSelect';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';

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
  discoverability: ('listed' | 'unlisted')[];
  onChange: (values: ('listed' | 'unlisted')[]) => void;
}

const DiscoverabilityFilter = ({ discoverability, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const values = OPTIONS.map((option) => ({
    label: formatMessage(option.message),
    value: option.value,
  }));

  return (
    <MultiSelect
      title={formatMessage(messages.discoverabilityLabel)}
      options={values}
      selected={discoverability}
      onChange={onChange}
    />
  );
};

export default DiscoverabilityFilter;
