import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import projectMessages from 'containers/Admin/projects/project/messages';

import { ManagerType } from 'components/admin/PostManager';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import { ManagerFilters, SetFilters } from '../useManagerParams';
import { PhaseCounts } from '../usePhaseCounts';

import ExportRow from './ExportRow';
import InputStats from './InputStats';
import OfflineCollection from './OfflineCollection';

interface Props {
  type: ManagerType;
  project: IProjectData;
  phase: IPhaseData;
  counts: PhaseCounts | undefined;
  statuses: IIdeaStatusData[];
  selectedIds: string[];
  filters: ManagerFilters;
  setFilters: SetFilters;
}

const SideColumn = ({
  type,
  project,
  phase,
  counts,
  statuses,
  selectedIds,
  filters,
  setFilters,
}: Props) => {
  const isVoting = phase.attributes.participation_method === 'voting';

  return (
    <>
      <InputStats
        type={type}
        phase={phase}
        counts={counts}
        statuses={statuses}
        filters={filters}
        setFilters={setFilters}
      />
      <OfflineCollection project={project} phase={phase}>
        <ExportRow
          type={type}
          projectId={project.id}
          selectedIds={selectedIds}
        />
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
      </OfflineCollection>
    </>
  );
};

export default SideColumn;
