import React from 'react';

import StatTile from 'design-system/StatTile';

import { IIdeaStatusData } from 'api/idea_statuses/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { PhaseCounts } from '../usePhaseCounts';

import styles from './RightColumn.module.css';

// Ideation statuses that mean the input was taken on.
const ACCEPTED_CODES = new Set(['accepted', 'implemented']);

interface Props {
  counts: PhaseCounts;
  /** Ideation statuses, to count the accepted inputs. Absent for proposals. */
  ideationStatuses?: IIdeaStatusData[];
}

const StatTiles = ({ counts, ideationStatuses }: Props) => {
  const { formatMessage } = useIntl();
  const accepted = ideationStatuses
    ?.filter((status) => ACCEPTED_CODES.has(status.attributes.code))
    .reduce((sum, status) => sum + (counts.byStatus[status.id] ?? 0), 0);

  return (
    <div className={styles.tiles}>
      <StatTile
        value={counts.total}
        label={formatMessage(messages.inputsTile)}
      />
      <StatTile
        value={counts.replied}
        label={formatMessage(messages.respondedTile)}
      />
      {accepted !== undefined && (
        <StatTile
          value={accepted}
          label={formatMessage(messages.acceptedTile)}
        />
      )}
    </div>
  );
};

export default StatTiles;
