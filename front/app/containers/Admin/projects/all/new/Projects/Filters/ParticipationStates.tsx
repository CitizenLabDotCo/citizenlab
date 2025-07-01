import React from 'react';

import { ParticipationState } from 'api/projects_mini_admin/types';

import FilterSelector from 'components/FilterSelector';

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
    text: formatMessage(option.message),
  }));

  return (
    <FilterSelector
      multipleSelectionAllowed
      selected={participationStates}
      values={options}
      mr={mr}
      onChange={onChange}
      title={formatMessage(messages.participationStates)}
      name="participation-states-select"
    />
  );
};

export default ParticipationStates;
