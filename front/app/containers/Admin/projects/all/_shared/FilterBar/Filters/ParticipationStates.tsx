import React from 'react';

import { ParticipationState } from 'api/projects_mini_admin/types';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { setParam, useParam } from '../../params';

import messages from './messages';
import tracks from './tracks';

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
  onClear: () => void;
}

const ParticipationStates = ({ onClear }: Props) => {
  const participationStates = useParam('participation_states') ?? [];
  const { formatMessage } = useIntl();

  const options = OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(option.message),
  }));

  return (
    <MultiSelect
      selected={participationStates}
      options={options}
      title={formatMessage(messages.participationStates)}
      openedDefaultValue={participationStates.length === 0}
      onChange={(participationStates) => {
        setParam(
          'participation_states',
          participationStates as ParticipationState[]
        );

        trackEventByName(tracks.setParticipationState, {
          participationStates: JSON.stringify(participationStates),
        });
      }}
      onClear={onClear}
    />
  );
};

export default ParticipationStates;
