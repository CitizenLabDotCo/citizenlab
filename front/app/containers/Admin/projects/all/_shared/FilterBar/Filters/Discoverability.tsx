import React from 'react';

import { Discoverability } from 'api/projects_mini_admin/types';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { useParam, setParam } from '../../params';

import messages from './messages';
import tracks from './tracks';

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

interface Props {
  onClear: () => void;
}

const DiscoverabilityFilter = ({ onClear }: Props) => {
  const value = useParam('discoverability') ?? [];
  const { formatMessage } = useIntl();

  const options = OPTIONS.map((option) => ({
    label: formatMessage(option.message),
    value: option.value,
  }));

  return (
    <MultiSelect
      title={formatMessage(messages.discoverabilityLabel)}
      options={options}
      selected={value}
      openedDefaultValue={value.length === 0}
      onChange={(discoverability) => {
        setParam('discoverability', discoverability as Discoverability[]);
        trackEventByName(tracks.setDiscoverability, {
          discoverabilities: JSON.stringify(discoverability),
        });
      }}
      onClear={onClear}
    />
  );
};

export default DiscoverabilityFilter;
