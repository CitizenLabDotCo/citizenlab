import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './MovePhase.module.css';
import MovePhaseDateRow from './MovePhaseDateRow';
import { PhasePlacementMove } from './usePhasePlacementMove';
import { getPhaseDateErrors } from './utils';

interface Props {
  placementMove: PhasePlacementMove;
}

const MovePhaseDates = ({ placementMove }: Props) => {
  const { formatMessage } = useIntl();
  const { proposedTimeline, draftPhase, changeDates, isPending } =
    placementMove;

  return (
    <Box as="fieldset" disabled={isPending} border="none" p="0" m="16px 0 0">
      <p className={styles.helper}>
        {formatMessage(messages.editTimelineDates)}
      </p>
      {proposedTimeline.map((phase) => (
        <MovePhaseDateRow
          key={phase.id}
          phase={phase}
          defaultOpen={phase.id === draftPhase.id}
          errors={getPhaseDateErrors(phase, proposedTimeline)}
          onChange={(dates) => changeDates(phase.id, dates)}
        />
      ))}
    </Box>
  );
};

export default MovePhaseDates;
