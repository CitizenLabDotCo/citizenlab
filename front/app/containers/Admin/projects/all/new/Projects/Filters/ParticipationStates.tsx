import React from 'react';

import { ParticipationState } from 'api/projects_mini_admin/types';

import MultiSelect from 'components/UI/MultiSelect';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  participationStates: ParticipationState[];
  mr?: string;
  onChange: (participationStates: ParticipationState[]) => void;
}

const OPTIONS: { value: ParticipationState; message: MessageDescriptor }[] = [
  {
    value: 'not_started',
    message: messages.notStarted,
  },
  {
    value: 'collecting_data',
    message: messages.collectingData,
  },
  {
    value: 'informing',
    message: messages.informing,
  },
  {
    value: 'past',
    message: messages.past,
  },
];

const ParticipationStates = ({ participationStates, mr, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const options = OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(option.message),
  }));

  return (
    <MultiSelect
      selected={participationStates}
      options={options}
      mr={mr}
      onChange={onChange}
      title={formatMessage(messages.participationStates)}
    />
  );
};

export default ParticipationStates;
