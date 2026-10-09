import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import projectMessages from 'containers/Admin/projects/project/messages';

import { ManagerType } from 'components/admin/PostManager';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import { PhaseCounts } from '../usePhaseCounts';

import AwaitingReply from './AwaitingReply';
import ExportsCard from './ExportsCard';
import OfflineCollection from './OfflineCollection';
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
    <Box display="flex" flexDirection="column" gap="16px">
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
        <Warning>
          {phase.attributes.autoshare_results_enabled ? (
            <Text color="teal700" m="0">
              <FormattedMessage
                {...projectMessages.votingShareResultsTurnedOn}
              />
            </Text>
          ) : (
            <Text color="teal700" m="0">
              <b>
                <FormattedMessage
                  {...projectMessages.votingShareResultsTurnedOff}
                />
              </b>{' '}
              <FormattedMessage
                {...projectMessages.votingShareResultsTurnedOff2}
              />
            </Text>
          )}
        </Warning>
      )}
      <OfflineCollection project={project} phase={phase} />
      <ExportsCard
        type={type}
        projectId={project.id}
        selectedIds={selectedIds}
      />
    </Box>
  );
};

export default RightColumn;
