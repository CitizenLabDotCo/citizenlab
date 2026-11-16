import React from 'react';

import Banner from 'design-system/Banner';
import 'design-system/tokens.css';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import projectMessages from 'containers/Admin/projects/project/messages';

import { ManagerType } from 'components/admin/PostManager';

import { FormattedMessage } from 'utils/cl-intl';

import { PhaseCounts } from '../usePhaseCounts';

import AwaitingReply from './AwaitingReply';
import ExportsCard from './ExportsCard';
import OfflineCollection from './OfflineCollection';
import styles from './RightColumn.module.css';
import StatTiles from './StatTiles';

interface Props {
  type: ManagerType;
  project: IProjectData;
  phase: IPhaseData;
  counts: PhaseCounts | undefined;
  statuses: IIdeaStatusData[];
  selectedIds: string[];
  onShowAwaitingReply: () => void;
}

const RightColumn = ({
  type,
  project,
  phase,
  counts,
  statuses,
  selectedIds,
  onShowAwaitingReply,
}: Props) => {
  const isVoting = phase.attributes.participation_method === 'voting';

  return (
    <div className={styles.column}>
      {counts && (
        <>
          <StatTiles
            counts={counts}
            ideationStatuses={
              type === 'ProjectProposals' ? undefined : statuses
            }
          />
          <AwaitingReply count={counts.awaiting} onShow={onShowAwaitingReply} />
        </>
      )}
      {isVoting && (
        <Banner tone="info">
          {phase.attributes.autoshare_results_enabled ? (
            <FormattedMessage {...projectMessages.votingShareResultsTurnedOn} />
          ) : (
            <>
              <strong>
                <FormattedMessage
                  {...projectMessages.votingShareResultsTurnedOff}
                />
              </strong>{' '}
              <FormattedMessage
                {...projectMessages.votingShareResultsTurnedOff2}
              />
            </>
          )}
        </Banner>
      )}
      <OfflineCollection project={project} phase={phase} />
      <ExportsCard
        type={type}
        projectId={project.id}
        selectedIds={selectedIds}
      />
    </div>
  );
};

export default RightColumn;
