import React from 'react';

import { ParticipationState } from 'api/projects_mini_admin/types';

import FilterSelector from 'components/FilterSelector';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { setParam, useParam } from './params';

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

interface Props {
  mr?: string;
}

const ParticipationStates = ({ mr }: Props) => {
  const participationStates = useParam('participation_states') ?? [];
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
      title={formatMessage(messages.participationStates)}
      name="participation-states-select"
      onChange={(participationStates) => {
        setParam(
          'participation_states',
          participationStates as ParticipationState[]
        );
      }}
    />
  );
};

export default ParticipationStates;
