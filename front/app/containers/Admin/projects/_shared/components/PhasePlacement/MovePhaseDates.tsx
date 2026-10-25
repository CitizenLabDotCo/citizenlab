import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import MovePhaseDateRow from './MovePhaseDateRow';
import { PhasePlacementMove } from './usePhasePlacementMove';

interface Props {
  placementMove: PhasePlacementMove;
}

const MovePhaseDates = ({ placementMove }: Props) => {
  const { formatMessage } = useIntl();
  const { proposedTimeline, draftPhase, invalidDates, changeDates, isPending } =
    placementMove;
  const orderedPhases = [...proposedTimeline].sort(
    (a, b) =>
      Date.parse(a.attributes.start_at) - Date.parse(b.attributes.start_at)
  );

  return (
    <Box as="fieldset" disabled={isPending} border="none" p="0" m="16px 0 0">
      <Text variant="boHelper">
        {formatMessage(messages.editTimelineDates)}
      </Text>
      {orderedPhases.map((phase) => (
        <MovePhaseDateRow
          key={phase.id}
          phase={phase}
          defaultOpen={phase.id === draftPhase.id}
          invalid={invalidDates.some(({ id }) => id === phase.id)}
          onChange={(dates) => changeDates(phase.id, dates)}
        />
      ))}
    </Box>
  );
};

export default MovePhaseDates;
