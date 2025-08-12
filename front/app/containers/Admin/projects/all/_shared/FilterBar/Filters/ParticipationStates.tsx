import React, { useRef } from 'react';

import { ParticipationState } from 'api/projects_mini_admin/types';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { setParam, useParam } from '../../params';

import { useFilterOpenByDefault } from './hooks/useFilterOpenByDefault';
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
  shouldOpenByDefault?: boolean;
  onOpened?: () => void;
}

const ParticipationStates = ({
  onClear,
  shouldOpenByDefault,
  onOpened,
}: Props) => {
  const participationStates = useParam('participation_states') ?? [];
  const { formatMessage } = useIntl();
  const filterRef = useRef<HTMLDivElement>(null);

  const { isOpened, setIsOpened } = useFilterOpenByDefault({
    shouldOpenByDefault,
    onOpened,
    filterRef,
  });

  const options = OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(option.message),
  }));

  return (
    <div ref={filterRef}>
      <MultiSelect
        selected={participationStates}
        options={options}
        title={formatMessage(messages.participationStates)}
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
        dataCy="projects-overview-filter-participation-states"
        opened={isOpened}
        onOpen={() => setIsOpened(true)}
      />
    </div>
  );
};

export default ParticipationStates;
